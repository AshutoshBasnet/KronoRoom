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
        name: 'Dr. Eleanor Vance',
        email: 'admin@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-ADM-001',
        role: 'admin',
        department: 'Campus Estates & IT Services'
      },
      {
        name: 'Prof. Arthur Pendelton',
        email: 'a.pendelton@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-FAC-101',
        role: 'teacher',
        department: 'Computing & Digital Media'
      },
      {
        name: 'Dr. Fiona Gallagher',
        email: 'f.gallagher@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-FAC-102',
        role: 'teacher',
        department: 'Business & Financial Management'
      },
      {
        name: 'Marcus Sterling',
        email: 'm.sterling@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-STU-202401',
        role: 'student',
        department: 'Computing & Digital Media'
      },
      {
        name: 'Zara Chen',
        email: 'z.chen@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-STU-202402',
        role: 'student',
        department: 'Architecture & Design'
      },
      {
        name: 'Liam O\'Connor',
        email: 'l.oconnor@londonmet.ac.uk',
        passwordHash,
        idCardNumber: 'LM-STU-202403',
        role: 'student',
        department: 'Human Sciences'
      }
    ]);

    const [admin, teacher1, teacher2, student1, student2, student3] = users;
    console.log(`[Seed Script]: Created ${users.length} users.`);

    // 2. Create Rooms
    console.log('[Seed Script]: Creating Rooms...');
    const rooms = await Room.insertMany([
      {
        roomNumber: 'T-301',
        building: 'Tower Building',
        capacity: 85,
        type: 'lecture_hall',
        amenities: [
          'Dual 4K Laser Projectors',
          'Surround Audio System',
          'Automated Lecture Capture',
          'Tiered Ergonomic Seating',
          'Wireless Microphones',
          'High-Speed Wi-Fi 6'
        ],
        isActive: true
      },
      {
        roomNumber: 'T-405',
        building: 'Tower Building',
        capacity: 35,
        type: 'computer_lab',
        amenities: [
          'Apple Mac Studio M2 Workstations',
          'Adobe Creative Cloud Suite',
          'Dual Color-Calibrated Displays',
          'Gigabit Ethernet & Fiber Uplink',
          'Interactive Smartboard'
        ],
        isActive: true
      },
      {
        roomNumber: 'LC-102',
        building: 'Learning Centre',
        capacity: 25,
        type: 'seminar_room',
        amenities: [
          'Interactive 85" Smartboard',
          '4K Video Conference Rig',
          'Modular Reconfigurable Tables',
          'Full-Height Whiteboard Walls',
          'Acoustic Ceiling Panels'
        ],
        isActive: true
      },
      {
        roomNumber: 'LC-201',
        building: 'Learning Centre',
        capacity: 45,
        type: 'computer_lab',
        amenities: [
          'Dell Precision Linux Workstations',
          'NVIDIA RTX 4080 GPUs',
          'Dual 27-inch 144Hz Displays',
          'Meta Quest Pro VR Development Kits',
          'Docker & Kubernetes Sandboxes'
        ],
        isActive: true
      },
      {
        roomNumber: 'SC-101',
        building: 'Science Centre',
        capacity: 120,
        type: 'lecture_hall',
        amenities: [
          'Dual Ultrawide Display Walls',
          'Acoustic Waveguide Sound',
          'Document Inspection Cameras',
          'Wheelchair Accessible Podiums',
          'Assisted Listening Loop'
        ],
        isActive: true
      },
      {
        roomNumber: 'SC-303',
        building: 'Science Centre',
        capacity: 30,
        type: 'seminar_room',
        amenities: [
          '4K Touchscreen Display',
          'AI-Tracking Hybrid Cameras',
          'Ceiling Beamforming Mic Array',
          'Herman Miller Ergonomic Chairs'
        ],
        isActive: true
      }
    ]);

    const [roomT301, roomT405, roomLC102, roomLC201, roomSC101, roomSC303] = rooms;
    console.log(`[Seed Script]: Created ${rooms.length} rooms.`);

    // 3. Create Sample Bookings (including 1 ongoing live booking right now!)
    console.log('[Seed Script]: Creating Sample Bookings...');
    const now = new Date();

    // Ongoing booking in T-301: Started 30 mins ago, finishes in 45 mins
    const ongoingStart = new Date(now.getTime() - 30 * 60 * 1000);
    const ongoingEnd = new Date(now.getTime() + 45 * 60 * 1000);

    // Upcoming booking in LC-102: Starts in 1.5 hours, finishes in 3.5 hours
    const upcomingStart = new Date(now.getTime() + 90 * 60 * 1000);
    const upcomingEnd = new Date(now.getTime() + 210 * 60 * 1000);

    // Another upcoming in T-405 tomorrow
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const bookings = await Booking.insertMany([
      {
        room: roomT301._id,
        user: teacher1._id,
        startTime: ongoingStart,
        endTime: ongoingEnd,
        purpose: 'CS6004: Advanced Distributed Cloud Systems Lecture',
        bookingType: 'Regular Class',
        status: 'confirmed',
        checkedIn: true,
        createdAt: new Date(now.getTime() - 45 * 60 * 1000)
      },
      {
        room: roomLC102._id,
        user: student1._id,
        startTime: upcomingStart,
        endTime: upcomingEnd,
        purpose: 'Final Year Capstone Project Collaborative Sprint',
        bookingType: 'Study Session',
        status: 'confirmed',
        checkedIn: false,
        createdAt: new Date(now.getTime() - 120 * 60 * 1000)
      },
      {
        room: roomT405._id,
        user: teacher2._id,
        startTime: tomorrowStart,
        endTime: tomorrowEnd,
        purpose: 'FIN302: Fintech Financial Modelling Lab',
        bookingType: 'Regular Class',
        status: 'confirmed',
        checkedIn: false,
        createdAt: new Date(now.getTime() - 10 * 60 * 1000)
      }
    ]);

    console.log(`[Seed Script]: Created ${bookings.length} seed bookings.`);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Sample Credentials (All passwords: "Password123"):');
    console.log(' - Admin:   admin@londonmet.ac.uk       (LM-ADM-001) [Campus Estates & IT]');
    console.log(' - Teacher: a.pendelton@londonmet.ac.uk (LM-FAC-101) [Computing & Digital Media]');
    console.log(' - Teacher: f.gallagher@londonmet.ac.uk (LM-FAC-102) [Business & Finance]');
    console.log(' - Student: m.sterling@londonmet.ac.uk  (LM-STU-202401) [Computing & Digital Media]');
    console.log(' - Student: z.chen@londonmet.ac.uk      (LM-STU-202402) [Architecture]');
    console.log(' - Student: l.oconnor@londonmet.ac.uk   (LM-STU-202403) [Human Sciences]');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Script Error]:', error);
    process.exit(1);
  }
};

seedData();
