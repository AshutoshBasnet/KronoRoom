import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    purpose: {
      type: String,
      required: [true, 'Booking purpose is required'],
      trim: true
    },
    bookingType: {
      type: String,
      enum: ['Regular Class', 'Ad-hoc Booking', 'Study Session', 'Maintenance'],
      default: 'Ad-hoc Booking'
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    seatNumber: {
      type: String,
      default: null,
      trim: true
    },
    selectedSeats: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index for conflict validation queries
bookingSchema.index({ room: 1, status: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, startTime: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
