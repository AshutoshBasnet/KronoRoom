import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-classroom';

async function migrate() {
  console.log('[Migration] Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('[Migration] Connected to MongoDB.');

  const bookings = await Booking.find({}).populate('user', 'role name');
  console.log(`[Migration] Found ${bookings.length} total bookings in database.`);

  let updatedCount = 0;
  for (const b of bookings) {
    if (b.bookingType === 'Ad-hoc Booking') {
      let newType = 'Study Session';
      if (b.user?.role === 'teacher') {
        newType = 'Regular Class';
      } else if (b.user?.role === 'student') {
        newType = 'Study Session';
      } else if (b.purpose?.toLowerCase().includes('lecture') || b.purpose?.toLowerCase().includes('class')) {
        newType = 'Regular Class';
      }

      await Booking.findByIdAndUpdate(b._id, { bookingType: newType });
      updatedCount++;
    }
  }

  console.log(`[Migration] Successfully updated ${updatedCount} bookings from 'Ad-hoc Booking' to accurate types.`);

  const allBookings = await Booking.find({});
  const dist = {};
  allBookings.forEach((b) => {
    dist[b.bookingType] = (dist[b.bookingType] || 0) + 1;
  });
  console.log('[Migration] Updated Distribution:', dist);

  await mongoose.disconnect();
  console.log('[Migration] Done!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});
