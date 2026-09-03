const mongoose = require('mongoose');
const dns = require('dns');

// Force Node to use Google DNS for resolving the Atlas SRV record —
// fixes ECONNREFUSED querySrv errors on some ISPs/Windows setups
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Connects to MongoDB Atlas using the URI from .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
