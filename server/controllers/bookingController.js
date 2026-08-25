import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { emitEvent } from '../socket.js';

// @desc    Create a new booking with conflict validation & role constraints
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { roomId, startTime, endTime, purpose, bookingType } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!roomId || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, startTime, endTime, and purpose'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // 1. Time validity check
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date/time format provided'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be strictly before end time'
      });
    }

    // Allow 5-minute buffer in case of slight local clock drift
    const allowedPastBuffer = new Date(now.getTime() - 5 * 60 * 1000);
    if (start < allowedPastBuffer) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book slots in the past'
      });
    }

    // 2. Room existence check
    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'The selected room is inactive or does not exist'
      });
    }

    // 3. Role Constraints
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const advanceDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (userRole === 'student') {
      // Max 2 hours per session
      if (durationMinutes > 120) {
        return res.status(400).json({
          success: false,
          message: 'Students can book up to a maximum of 2 hours per session'
        });
      }
      // Max 3 days in advance
      if (advanceDays > 3) {
        return res.status(400).json({
          success: false,
          message: 'Students can only book up to 3 days in advance'
        });
      }
    } else if (userRole === 'teacher') {
      // Max 6 hours per session
      if (durationMinutes > 360) {
        return res.status(400).json({
          success: false,
          message: 'Faculty members can book up to a maximum of 6 hours per session'
        });
      }
      // Max 30 days in advance
      if (advanceDays > 30) {
        return res.status(400).json({
          success: false,
          message: 'Faculty members can book up to 30 days in advance'
        });
      }
    }

    // 4. Strict Overlap / Concurrency Conflict Check
    // Overlap condition: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
    const conflictingBooking = await Booking.findOne({
      room: roomId,
      status: 'confirmed',
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).populate('user', 'name role department');

    if (conflictingBooking) {
      const conflictStart = new Date(conflictingBooking.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      const conflictEnd = new Date(conflictingBooking.endTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      return res.status(409).json({
        success: false,
        message: `Conflict detected: Room ${room.roomNumber} is already booked from ${conflictStart} to ${conflictEnd} for '${conflictingBooking.purpose}'`,
        conflict: {
          bookingId: conflictingBooking._id,
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
          purpose: conflictingBooking.purpose,
          bookedBy: conflictingBooking.user?.name || 'Another user'
        }
      });
    }

    // 5. Create Booking
    const booking = await Booking.create({
      room: roomId,
      user: userId,
      startTime: start,
      endTime: end,
      purpose: purpose.trim(),
      bookingType: bookingType || (userRole === 'student' ? 'Study Session' : 'Regular Class'),
      status: 'confirmed',
      checkedIn: false
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('user', 'name email role department idCardNumber');

    // Emit live WebSocket update
    emitEvent('booking:created', {
      booking: populatedBooking,
      roomId: room._id,
      roomNumber: room.roomNumber
    });

    return res.status(201).json({
      success: true,
      message: 'Room booked successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's personal bookings (upcoming & history)
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort({ startTime: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active bookings for a specific room (for calendar slot view)
// @route   GET /api/bookings/room/:roomId
// @access  Public
export const getRoomBookings = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { date } = req.query;

    const query = {
      room: roomId,
      status: 'confirmed'
    };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name role department')
      .sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all campus bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, room, role, limit = 100 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (room && room !== 'all') {
      query.room = room;
    }

    const bookings = await Booking.find(query)
      .populate('room')
      .populate('user', 'name email role department idCardNumber')
      .sort({ startTime: -1 })
      .limit(Number(limit));

    const totalConfirmed = await Booking.countDocuments({ status: 'confirmed' });
    const totalCompleted = await Booking.countDocuments({ status: 'completed' });
    const totalCancelled = await Booking.countDocuments({ status: 'cancelled' });
    const checkedInCount = await Booking.countDocuments({ checkedIn: true });

    return res.status(200).json({
      success: true,
      stats: {
        total: totalConfirmed + totalCompleted + totalCancelled,
        confirmed: totalConfirmed,
        completed: totalCompleted,
        cancelled: totalCancelled,
        checkedIn: checkedInCount
      },
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking (Owner or Admin only)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Owner or Admin authorization
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    emitEvent('booking:cancelled', {
      bookingId: booking._id,
      roomId: booking.room?._id,
      roomNumber: booking.room?.roomNumber
    });

    return res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in to a booking
// @route   PATCH /api/bookings/:id/check-in
// @access  Private
export const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the booking owner or an admin can check in'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in to a booking with status '${booking.status}'`
      });
    }

    if (booking.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'You are already checked in for this session'
      });
    }

    booking.checkedIn = true;
    await booking.save();

    emitEvent('booking:checkedIn', {
      bookingId: booking._id,
      roomId: booking.room?._id,
      roomNumber: booking.room?.roomNumber
    });

    return res.status(200).json({
      success: true,
      message: 'Check-in successful! Room occupancy confirmed.',
      booking
    });
  } catch (error) {
    next(error);
  }
};
