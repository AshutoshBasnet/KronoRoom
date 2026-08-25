import express from 'express';
import {
  createBooking,
  getMyBookings,
  getRoomBookings,
  getAllBookings,
  cancelBooking,
  checkInBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Specific routes first before /:id parameter matching
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/all', protect, requireRole('admin'), getAllBookings);
router.get('/room/:roomId', getRoomBookings);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/check-in', protect, checkInBooking);

export default router;
