import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { emitEvent } from '../socket.js';

// @desc    Get all active rooms with optional query filters
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    const { type, building, minCapacity, search } = req.query;

    const query = { isActive: true };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (building && building !== 'all') {
      query.building = building;
    }

    if (minCapacity) {
      query.capacity = { $gte: Number(minCapacity) };
    }

    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } },
        { amenities: { $regex: search, $options: 'i' } }
      ];
    }

    const rooms = await Room.find(query).sort({ building: 1, roomNumber: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated live occupancy status for all rooms
// @route   GET /api/rooms/live-status
// @access  Public
export const getLiveStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const rooms = await Room.find({ isActive: true }).sort({ building: 1, roomNumber: 1 });

    // Fetch all active confirmed bookings for today/near future
    const liveStatusList = await Promise.all(
      rooms.map(async (room) => {
        // Find all ongoing active bookings in session right now
        const activeBookings = await Booking.find({
          room: room._id,
          status: 'confirmed',
          startTime: { $lte: now },
          endTime: { $gt: now }
        }).populate('user', 'name role department email idCardNumber');

        // Find upcoming confirmed bookings
        const upcomingBookings = await Booking.find({
          room: room._id,
          status: 'confirmed',
          startTime: { $gt: now }
        })
          .sort({ startTime: 1 })
          .populate('user', 'name role department email idCardNumber');

        const currentBooking = activeBookings[0] || null;
        const nextBooking = upcomingBookings[0] || null;

        // Collect all occupied seats from active bookings
        const occupiedSeatsSet = new Set();
        let isFullRoomOccupied = false;

        activeBookings.forEach((b) => {
          if (Array.isArray(b.selectedSeats) && b.selectedSeats.length > 0) {
            b.selectedSeats.forEach((s) => occupiedSeatsSet.add(s));
          } else if (b.seatNumber) {
            b.seatNumber.split(',').forEach((s) => {
              const trimmed = s.trim();
              if (trimmed) occupiedSeatsSet.add(trimmed);
            });
          } else {
            // Whole room booking (e.g., class lecture or maintenance)
            isFullRoomOccupied = true;
          }
        });

        // Collect all reserved seats from upcoming bookings
        const reservedSeatsSet = new Set();
        upcomingBookings.forEach((b) => {
          if (Array.isArray(b.selectedSeats) && b.selectedSeats.length > 0) {
            b.selectedSeats.forEach((s) => reservedSeatsSet.add(s));
          } else if (b.seatNumber) {
            b.seatNumber.split(',').forEach((s) => {
              const trimmed = s.trim();
              if (trimmed) reservedSeatsSet.add(trimmed);
            });
          }
        });

        const occupiedSeats = Array.from(occupiedSeatsSet);
        const reservedSeats = Array.from(reservedSeatsSet);

        let occupancyData = {
          room,
          isOccupied: activeBookings.length > 0,
          isFullRoomOccupied,
          occupiedSeats,
          reservedSeats,
          occupiedCount: isFullRoomOccupied ? room.capacity : occupiedSeats.length,
          availableSeatsCount: isFullRoomOccupied
            ? 0
            : Math.max(0, room.capacity - occupiedSeats.length),
          currentBooking: null,
          nextBooking: null
        };

        if (currentBooking) {
          const timeRemainingMs = new Date(currentBooking.endTime).getTime() - now.getTime();
          const timeRemainingMinutes = Math.max(0, Math.ceil(timeRemainingMs / (1000 * 60)));

          const elapsedCreatedMs = now.getTime() - new Date(currentBooking.createdAt).getTime();
          const elapsedCreatedMinutes = Math.max(0, Math.floor(elapsedCreatedMs / (1000 * 60)));

          occupancyData.currentBooking = {
            _id: currentBooking._id,
            startTime: currentBooking.startTime,
            endTime: currentBooking.endTime,
            purpose: currentBooking.purpose,
            bookingType: currentBooking.bookingType,
            checkedIn: currentBooking.checkedIn,
            seatNumber: currentBooking.seatNumber || null,
            selectedSeats: currentBooking.selectedSeats || [],
            createdAt: currentBooking.createdAt,
            timeRemainingMinutes,
            elapsedCreatedMinutes,
            user: {
              _id: currentBooking.user?._id,
              name: currentBooking.user?.name || 'Unknown',
              role: currentBooking.user?.role || 'user',
              department: currentBooking.user?.department || 'University Member',
              idCardNumber: currentBooking.user?.idCardNumber
            }
          };
        }

        if (nextBooking) {
          occupancyData.nextBooking = {
            _id: nextBooking._id,
            startTime: nextBooking.startTime,
            endTime: nextBooking.endTime,
            purpose: nextBooking.purpose,
            bookingType: nextBooking.bookingType,
            seatNumber: nextBooking.seatNumber || null,
            selectedSeats: nextBooking.selectedSeats || [],
            user: {
              name: nextBooking.user?.name || 'Unknown',
              role: nextBooking.user?.role || 'user'
            }
          };
        }

        return occupancyData;
      })
    );

    return res.status(200).json({
      success: true,
      timestamp: now,
      data: liveStatusList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room details
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    return res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new room (Admin only)
// @route   POST /api/rooms
// @access  Private (Admin)
export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, building, capacity, type, amenities } = req.body;

    if (!roomNumber || !building || !capacity || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, building, capacity, and type'
      });
    }

    const existingRoom = await Room.findOne({
      roomNumber: roomNumber.toUpperCase().trim()
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room with number '${roomNumber}' already exists`
      });
    }

    const room = await Room.create({
      roomNumber: roomNumber.toUpperCase().trim(),
      building: building.trim(),
      capacity: Number(capacity),
      type,
      amenities: Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
        ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : []
    });

    emitEvent('room:created', room);

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a room (Admin only)
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
export const updateRoom = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }

    const { roomNumber, building, capacity, type, amenities, isActive } = req.body;

    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (roomNumber && roomNumber.toUpperCase().trim() !== room.roomNumber) {
      const duplicate = await Room.findOne({
        roomNumber: roomNumber.toUpperCase().trim(),
        _id: { $ne: req.params.id }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Room number '${roomNumber}' is already in use by another room`
        });
      }
      room.roomNumber = roomNumber.toUpperCase().trim();
    }

    if (building) room.building = building.trim();
    if (capacity) room.capacity = Number(capacity);
    if (type) room.type = type;
    if (amenities !== undefined) {
      room.amenities = Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
        ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : room.amenities;
    }
    if (isActive !== undefined) room.isActive = isActive;

    await room.save();

    emitEvent('room:updated', room);

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a room (Admin only)
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    room.isActive = false;
    await room.save();

    emitEvent('room:deleted', { id: room._id });

    return res.status(200).json({
      success: true,
      message: 'Room deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};
