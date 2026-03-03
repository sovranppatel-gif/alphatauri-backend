// seed/seed-attendance.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from '../src/models/Attendance.js';
import User from '../src/models/User.js';

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alpha-db');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed attendance data
const seedAttendance = async () => {
  try {
    await connectDB();

    // Get user IDs from database
    const users = await User.find({
      email: {
        $in: [
          'rahul@alphatauri.com',
          'ankit@alphatauri.com',
          'pooja@alphatauri.com',
          'ravi@alphatauri.com',
          'sneha@alphatauri.com',
          'sovran@alphatauri.com'
        ]
      }
    }).select('_id name emp_id email');

    console.log(`📋 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      process.exit(1);
    }

    // Use today's date for attendance (in UTC to match query)
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const day = today.getUTCDate();
    const todayUtc = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

    // Attendance data based on user status
    const attendanceData = [
      // Rahul Sharma - EMP001 - Present (late by 15 min)
      {
        userId: users.find(u => u.email === 'rahul@alphatauri.com')?._id,
        date: todayUtc,
        checkIn: '09:15 AM',
        checkOut: '06:30 PM',
        hours: '9h 15m',
        status: 'Present',
        late: true,
        lateBy: '15 minutes',
      },
      // Ankit Patel - EMP002 - Absent
      {
        userId: users.find(u => u.email === 'ankit@alphatauri.com')?._id,
        date: todayUtc,
        checkIn: null,
        checkOut: null,
        hours: null,
        status: 'Absent',
        late: false,
        lateBy: null,
      },
      // Pooja Singh - EMP003 - Present (on time)
      {
        userId: users.find(u => u.email === 'pooja@alphatauri.com')?._id,
        date: todayUtc,
        checkIn: '09:00 AM',
        checkOut: '06:00 PM',
        hours: '9h 0m',
        status: 'Present',
        late: false,
        lateBy: null,
      },
      // Ravi Kumar - EMP004 - Present (on time)
      {
        userId: users.find(u => u.email === 'ravi@alphatauri.com')?._id,
        date: todayUtc,
        checkIn: '09:05 AM',
        checkOut: '06:15 PM',
        hours: '9h 10m',
        status: 'Present',
        late: false,
        lateBy: null,
      },
      // Sneha Verma - EMP005 - Absent
      {
        userId: users.find(u => u.email === 'sneha@alphatauri.com')?._id,
        date: todayUtc,
        checkIn: null,
        checkOut: null,
        hours: null,
        status: 'Absent',
        late: false,
        lateBy: null,
      },
      // Sovran Singh Patel - 001 - Present (late by 1 hour)
      {
        userId: users.find(u => u.email === 'sovran@alphatauri.com')?._id,
        date: todayUtc,
        checkIn: '10:00 AM',
        checkOut: '07:00 PM',
        hours: '9h 0m',
        status: 'Present',
        late: true,
        lateBy: '1 hour',
      },
    ].filter(item => item.userId); // Filter out any users that weren't found

    // Clear existing attendance for today
    const nextDayUtc = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));
    await Attendance.deleteMany({
      date: {
        $gte: todayUtc,
        $lt: nextDayUtc,
      },
    });
    console.log('🗑️  Cleared existing attendance for today');

    // Insert attendance records
    const created = await Attendance.insertMany(attendanceData);
    console.log(`✅ Created ${created.length} attendance records`);

    // Display created records
    console.log('\n📊 Created Attendance Records:');
    for (const att of created) {
      const user = users.find(u => u._id.toString() === att.userId.toString());
      console.log(`   - ${user?.name || 'Unknown'} (${user?.emp_id || 'N/A'}): ${att.status}`);
    }

    console.log('\n✅ Attendance seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
    process.exit(1);
  }
};

// Run seed
seedAttendance();
