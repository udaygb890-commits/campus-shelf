const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<user>')) {
      console.warn('⚠️ MongoDB URI contains placeholder values. Set a valid MONGO_URI in server/.env to enable persistence. Server running in fallback mode.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Server will continue running without MongoDB connection.');
  }
};

module.exports = connectDB;
