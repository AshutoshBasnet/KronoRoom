import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    building: {
      type: String,
      required: [true, 'Building is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    type: {
      type: String,
      enum: ['lecture_hall', 'computer_lab', 'seminar_room'],
      required: [true, 'Room type is required']
    },
    amenities: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for formatted room label
roomSchema.virtual('displayName').get(function () {
  return `${this.roomNumber} - ${this.building}`;
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
