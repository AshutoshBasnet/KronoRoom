import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

export async function autoSeedIfEmpty() {
  try {
    // Security Enforcement: Sanitize any unauthorized admin accounts
    // Only the master admin (admin@londonmet.ac.uk) is permitted to hold the 'admin' role.
    const unauthorizedAdmins = await User.updateMany(
      { role: 'admin', email: { $ne: 'admin@londonmet.ac.uk' } },
      { $set: { role: 'student' } }
    );
    if (unauthorizedAdmins.modifiedCount > 0) {
      console.log(`[Security Policy]: Downgraded ${unauthorizedAdmins.modifiedCount} unauthorized admin account(s) to student role.`);
    }

    const userCount = await User.countDocuments();
    const roomCount = await Room.countDocuments();

    if (userCount > 0 && roomCount > 0) {
      console.log('[AutoSeed]: Database already contains data, skipping initial seeding.');
      return;
    }

    console.log('[AutoSeed]: Seeding initial London Met campus data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    // 1. Create Users (Strict single admin)
    const users = await User.insertMany([
      {
        name: 'Campus Estates & IT Admin',
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

    const [adminUser, facultySubigyan, studentAshutosh] = users;

    // 2. Create Rooms
    const rooms = await Room.insertMany([
      {
        roomNumber: 'Lab-01',
        building: 'Skill Block',
        capacity: 50,
        type: 'computer_lab',
        amenities: ['High Power Workstations', 'AC', 'Smart Board'],
        isActive: true
      },
      {
        roomNumber: 'Lab-02',
        building: 'Skill Block',
        capacity: 50,
        type: 'computer_lab',
        amenities: ['High Power Workstations', 'AC', 'Smart Board'],
        isActive: true
      },
      {
        roomNumber: 'LT-01',
        building: 'London Block',
        capacity: 80,
        type: 'seminar_room',
        amenities: ['Small Projector', 'AC'],
        isActive: true
      },
      {
        roomNumber: 'LT-02',
        building: 'London Block',
        capacity: 80,
        type: 'seminar_room',
        amenities: ['Small Projector', 'AC'],
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
          'Big Projector Display Wall'
        ],
        isActive: true
      }
    ]);

    const [roomLab01, roomLab02, roomLT01, roomLT02, roomHall01] = rooms;

    // 3. Create Sample Initial Booking
    const now = new Date();
    const ongoingStart = new Date(now.getTime() - 30 * 60 * 1000);
    const ongoingEnd = new Date(now.getTime() + 45 * 60 * 1000);
    const upcomingStart = new Date(now.getTime() + 90 * 60 * 1000);
    const upcomingEnd = new Date(now.getTime() + 210 * 60 * 1000);

    await Booking.insertMany([
      {
        room: roomLab01._id,
        user: facultySubigyan._id,
        startTime: ongoingStart,
        endTime: ongoingEnd,
        purpose: 'CS5053NI: Cloud Computing and IoT Lab',
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
        purpose: 'CC5051NI: Databases Collaborative Study',
        bookingType: 'Study Session',
        status: 'confirmed',
        checkedIn: false,
        seatNumber: 'B4',
        createdAt: new Date(now.getTime() - 120 * 60 * 1000)
      }
    ]);

    console.log('[AutoSeed]: ✅ Initial London Met data seeded successfully!');
  } catch (err) {
    console.error('[AutoSeed Error]:', err.message);
  }
}
