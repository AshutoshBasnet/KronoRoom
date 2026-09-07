import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { emitEvent } from '../socket.js';

// Check-in grace period auto-release function (temporarily disabled)
export const startAutoReleaseCron = () => {
  // Grace period auto-release is temporarily disabled.
  console.log('[Cron Job]: 15-minute check-in grace period auto-release is disabled.');
};
