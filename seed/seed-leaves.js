// seed/seed-leaves.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Leave from '../src/models/Leave.js';
import User from '../src/models/User.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/alpha-db';
    await mongoose.connect(mongoURI, {
      dbName: 'alpha-db',
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedLeaves = async () => {
  try {
    await connectDB();

    // Get all users
    const users = await User.find().select('_id name');
    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      process.exit(1);
    }

    console.log(`📝 Found ${users.length} users`);

    // Clear existing leaves
    await Leave.deleteMany({});
    console.log('🗑️  Cleared existing leaves');

    // Create dummy leave requests
    const leaves = [];

    // Generate leaves for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Create 2-4 leaves per user
      const numLeaves = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < numLeaves; j++) {
        const daysOffset = Math.floor(Math.random() * 30); // Within next 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + daysOffset);
        
        const duration = Math.floor(Math.random() * 5) + 1; // 1-5 days
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration - 1);

        const types = ['Sick Leave', 'Annual Leave', 'Family Function', 'Medical', 'Personal'];
        const reasons = [
          'Family function',
          'Doctor\'s Appointment',
          'Personal work',
          'Medical emergency',
          'Vacation',
          'Wedding',
        ];

        const statuses = ['Pending', 'Approved', 'Rejected'];
        const weights = [0.4, 0.5, 0.1]; // 40% pending, 50% approved, 10% rejected
        
        let status;
        const rand = Math.random();
        if (rand < weights[0]) status = statuses[0];
        else if (rand < weights[0] + weights[1]) status = statuses[1];
        else status = statuses[2];

        const appliedDate = new Date(startDate);
        appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 7) - 1);

        const leaveData = {
          userId: user._id,
          startDate: startDate,
          endDate: endDate,
          type: types[Math.floor(Math.random() * types.length)],
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          status: status,
          appliedDate: appliedDate,
          resolvedDate: status !== 'Pending' ? new Date(appliedDate.getTime() + Math.random() * 86400000 * 2) : null,
        };

        leaves.push(leaveData);
      }
    }

    const inserted = await Leave.insertMany(leaves);
    console.log(`✅ Created ${inserted.length} leave requests`);

    // Show summary
    const summary = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('\n📊 Leave Status Summary:');
    summary.forEach((item) => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n✅ Leave seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding leaves:', error);
    process.exit(1);
  }
};

seedLeaves();
