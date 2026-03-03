// seed/seed-requests.js
import 'dotenv/config';
import mongoose from 'mongoose';
import UserRequest from '../src/models/Request.js';
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

const seedRequests = async () => {
  try {
    await connectDB();

    // Get all users
    const users = await User.find().select('_id name');
    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      process.exit(1);
    }

    console.log(`📝 Found ${users.length} users`);

    // Clear existing requests
    await UserRequest.deleteMany({});
    console.log('🗑️  Cleared existing requests');

    // Create dummy requests
    const requests = [];

    // Generate requests for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Create 2-5 requests per user
      const numRequests = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < numRequests; j++) {
        const requestTypes = ['Leave', 'Permission', 'Other'];
        const type = requestTypes[Math.floor(Math.random() * requestTypes.length)];

        const titles = [
          'Sick Leave Request',
          'Annual Leave Request',
          'Early Departure Request',
          'Late Arrival Request',
          'Permission for Personal Work',
          'Medical Leave Request',
          'Family Emergency Leave',
        ];

        const descriptions = [
          'Need to take sick leave for medical reasons',
          'Planning to take annual leave for vacation',
          'Need to leave early for personal work',
          'Requesting permission for late arrival',
          'Family emergency requires immediate leave',
          'Medical appointment scheduled',
          'Personal work that cannot be avoided',
        ];

        const statuses = ['Pending', 'Approved', 'Rejected'];
        const weights = [0.3, 0.6, 0.1]; // 30% pending, 60% approved, 10% rejected
        
        let status;
        const rand = Math.random();
        if (rand < weights[0]) status = statuses[0];
        else if (rand < weights[0] + weights[1]) status = statuses[1];
        else status = statuses[2];

        const appliedDate = new Date();
        appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 14));

        const requestData = {
          userId: user._id,
          type: type,
          title: titles[Math.floor(Math.random() * titles.length)],
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          status: status,
          appliedDate: appliedDate,
          resolvedDate: status !== 'Pending' ? new Date(appliedDate.getTime() + Math.random() * 86400000 * 3) : null,
          date: type === 'Permission' ? new Date(appliedDate.getTime() + Math.random() * 86400000 * 7) : null,
          time: type === 'Permission' ? `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}` : null,
        };

        requests.push(requestData);
      }
    }

    const inserted = await UserRequest.insertMany(requests);
    console.log(`✅ Created ${inserted.length} requests`);

    // Show summary
    const summaryByStatus = await UserRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summaryByType = await UserRequest.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('\n📊 Request Status Summary:');
    summaryByStatus.forEach((item) => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n📊 Request Type Summary:');
    summaryByType.forEach((item) => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n✅ Request seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding requests:', error);
    process.exit(1);
  }
};

seedRequests();
