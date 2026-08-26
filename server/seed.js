import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';

// Fix for Windows querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

import User from './models/User.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-classroom';
    console.log(`[Seed Script]: Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed Script]: MongoDB Connected.');

    // Clear existing collections
    console.log('[Seed Script]: Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});

    // Hash password for default users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    // 1. Create Users
    console.log('[Seed Script]: Creating Users...');
    const users = await User.insertMany([
      {
        name: 'Admin',
        email: 'admin@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-ADM-001',
        role: 'admin',
        department: 'Campus Estates & IT Services'
      },
      {
        name: 'Subigyan Adhikari',
        email: 's.adhikari@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-FAC-101',
        role: 'teacher',
        department: 'Computing & Engineering'
      },
      {
        name: 'Ashutosh Basnet',
        email: 'a.basnet@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-STU-202401',
        role: 'student',
        department: 'Computing & Digital Media'
      },
      {
        name: 'Anmol Poudel',
        email: 'a.poudel@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-STU-202402',
        role: 'student',
        department: 'Architecture & Engineering'
      },
      {
        name: 'Parjun Rai',
        email: 'p.rai@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-STU-202403',
        role: 'student',
        department: 'Business & Human Sciences'
      }
    ]);

    const [adminUser, facultySubigyan, studentAshutosh, studentAnmol, studentParjun] = users;
    console.log(`[Seed Script]: Created ${users.length} users.`);

    // 2. Create Rooms
    console.log('[Seed Script]: Creating Rooms...');
    const rooms = await Room.insertMany([
      {
        roomNumber: 'Lab-01',
        building: 'Skill Block',
        capacity: 50,
        type: 'computer_lab',
        amenities: [
          'High Power Workstations',
          'AC',
          'Smart Board'
        ],
        isActive: true
      },
      {
        roomNumber: 'Lab-02',
        building: 'Skill Block',
        capacity: 50,
        type: 'computer_lab',
        amenities: [
          'High Power Workstations',
          'AC',
          'Smart Board'
        ],
        isActive: true
      },
      {
        roomNumber: 'LT-01',
        building: 'London Block',
        capacity: 80,
        type: 'seminar_room',
        amenities: [
          'Small Projector',
          'AC'
        ],
        isActive: true
      },
      {
        roomNumber: 'LT-02',
        building: 'London Block',
        capacity: 80,
        type: 'seminar_room',
        amenities: [
          'Small Projector',
          'AC'
        ],
        isActive: true
      },
      {
        roomNumber: 'Hall-01',
        building: 'Kumari Block',
        capacity: 100,
        type: 'lecture_hall',
        amenities: [
          '100-seat Auditorium',
          'Surround Sound Audio Speakers',
          'Big Projector Display Wall',
          'Big Projector'
        ],
        isActive: true
      }
    ]);

    const [roomLab01, roomLab02, roomLT01, roomLT02, roomHall01] = rooms;
    console.log(`[Seed Script]: Created ${rooms.length} rooms.`);

    // 3. Create Sample Bookings (including 1 ongoing live booking right now!)
    console.log('[Seed Script]: Creating Sample Bookings...');
    const now = new Date();

    // Ongoing live booking in Lab-01: Started 30 mins ago, finishes in 45 mins (Students studying right now!)
    const ongoingStart = new Date(now.getTime() - 30 * 60 * 1000);
    const ongoingEnd = new Date(now.getTime() + 45 * 60 * 1000);

    // Upcoming booking in LT-01: Starts in 1.5 hours, finishes in 3.5 hours
    const upcomingStart = new Date(now.getTime() + 90 * 60 * 1000);
    const upcomingEnd = new Date(now.getTime() + 210 * 60 * 1000);

    // Another upcoming in Hall-01 tomorrow
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const bookings = await Booking.insertMany([
      {
        room: roomLab01._id,
        user: facultySubigyan._id,
        startTime: ongoingStart,
        endTime: ongoingEnd,
        purpose: 'CS5053NI: Cloud Computing and the Internet of Things Lab',
        bookingType: 'Regular Class',
        status: 'confirmed',
        checkedIn: true,
        seatNumber: 'A1',
        createdAt: new Date(now.getTime() - 45 * 60 * 1000)
      },
      {
        room: roomLT01._id,
        user: studentAshutosh._id,
        startTime: upcomingStart,
        endTime: upcomingEnd,
        purpose: 'CC5051NI: Databases — Collaborative Study Sprint',
        bookingType: 'Study Session',
        status: 'confirmed',
        checkedIn: false,
        seatNumber: 'B4',
        createdAt: new Date(now.getTime() - 120 * 60 * 1000)
      },
      {
        room: roomHall01._id,
        user: facultySubigyan._id,
        startTime: tomorrowStart,
        endTime: tomorrowEnd,
        purpose: 'CS5002NI: Software Engineering Keynote Lecture',
        bookingType: 'Regular Class',
        status: 'confirmed',
        checkedIn: false,
        seatNumber: 'A5',
        createdAt: new Date(now.getTime() - 10 * 60 * 1000)
      }
    ]);

    console.log(`[Seed Script]: Created ${bookings.length} seed bookings.`);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Sample Credentials (All passwords: "Password123"):');
    console.log(' - Admin:   admin@londonmet.ac.uk       (LM-ADM-001) [Campus Estates & IT]');
    console.log(' - Teacher: s.adhikari@londonmet.ac.uk  (LM-FAC-101) [Subigyan Adhikari]');
    console.log(' - Student: a.basnet@londonmet.ac.uk    (LM-STU-202401) [Ashutosh Basnet]');
    console.log(' - Student: a.poudel@londonmet.ac.uk    (LM-STU-202402) [Anmol Poudel]');
    console.log(' - Student: p.rai@londonmet.ac.uk       (LM-STU-202403) [Parjun Rai]');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Script Error]:', error);
    process.exit(1);
  }
};

seedData();
