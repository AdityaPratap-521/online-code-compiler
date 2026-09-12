const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/online-compiler', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Local connection warning: ${err.message}. Enabling hybrid in-memory Job Store.`);
    return false;
  }
};

module.exports = connectDB;
