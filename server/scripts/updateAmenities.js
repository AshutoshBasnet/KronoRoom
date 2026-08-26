import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

import Room from '../models/Room.js';

const updateAmenities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    // Computer Labs
    await Room.updateMany(
      { roomNumber: { $in: ['Lab-01', 'Lab-02'] } },
      { amenities: ['High Power Workstations', 'AC', 'Smart Board'] }
    );

    // Seminar Rooms
    await Room.updateMany(
      { roomNumber: { $in: ['LT-01', 'LT-02'] } },
      { amenities: ['Small Projector', 'AC'] }
    );

    // Lecture Hall
    await Room.updateMany(
      { roomNumber: 'Hall-01' },
      {
        amenities: [
          '100-seat Auditorium',
          'Surround Sound Audio Speakers',
          'Big Projector Display Wall',
          'Big Projector'
        ]
      }
    );

    console.log('Successfully updated room amenities in MongoDB Atlas:');
    const rooms = await Room.find({}, 'roomNumber building amenities');
    console.log(JSON.stringify(rooms, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error updating amenities:', err);
    process.exit(1);
  }
};

updateAmenities();
