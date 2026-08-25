import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { emitEvent } from '../socket.js';

export const startAutoReleaseCron = () => {
  // Run every 5 minutes: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      // 15 minutes grace period threshold
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      // Find bookings where:
      // 1. status is 'confirmed'
      // 2. checkedIn is false
      // 3. startTime was more than 15 minutes ago
      const overdueBookings = await Booking.find({
        status: 'confirmed',
        checkedIn: false,
        startTime: { $lt: fifteenMinutesAgo }
      }).populate('room');

      if (overdueBookings.length > 0) {
        console.log(`[Auto-Release Cron]: Found ${overdueBookings.length} unattended booking(s) exceeding 15-minute check-in grace period.`);

        for (const booking of overdueBookings) {
          booking.status = 'cancelled';
          await booking.save();

          console.log(`[Auto-Release Cron]: Released Room ${booking.room?.roomNumber || booking.room} (Booking ID: ${booking._id})`);

          // Emit real-time notification
          emitEvent('booking:autoReleased', {
            bookingId: booking._id,
            roomId: booking.room?._id,
            roomNumber: booking.room?.roomNumber,
            reason: 'Unattended booking past 15-minute check-in window'
          });
        }
      }
    } catch (error) {
      console.error('[Auto-Release Cron Error]:', error.message);
    }
  });

  console.log('[Cron Job Initialized]: Auto-Release unattended bookings (Every 5 minutes)');
};
