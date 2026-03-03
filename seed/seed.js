// seed.js

import 'dotenv/config';
import bcrypt from 'bcrypt';
import connectDB from '../src/db/connection.js';
import User from '../src/models/User.js';

(async () => {
  try {
    await connectDB();
    const password = await bcrypt.hash('admin123', 12);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@alphatauri.com' },
      { 
        name: 'Admin User', 
        email: 'admin@alphatauri.com', 
        password, 
        role: 'admin', 
        status: 'Present' 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Seeded admin user:', admin.email);
    console.log('📧 Email: admin@alphatauri.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  }
})();
