import express from 'express';
import {
  getRooms,
  getLiveStatus,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/live-status', getLiveStatus);
router.get('/:id', getRoomById);

// Admin-only routes
router.post('/', protect, requireRole('admin'), createRoom);
router.put('/:id', protect, requireRole('admin'), updateRoom);
router.delete('/:id', protect, requireRole('admin'), deleteRoom);

export default router;
