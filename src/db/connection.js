// db/connection.js

import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error('MONGO_URL missing in .env');
    process.exit(1);
  }
  try {
    const dbName = 'alpha-db';
    
    // Use dbName option instead of modifying URI (more reliable)
    await mongoose.connect(uri, {
      dbName: dbName,
      autoIndex: true,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected to database: ${dbName}`);
    mongoose.connection.on('error', err => console.error('Mongo error:', err));
  } catch (error) {
    console.error("Connection failed", error.message);
    process.exit(1);
  }
};

export default connectDB;
