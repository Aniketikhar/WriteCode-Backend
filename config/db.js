const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // console.log(`MongoDB: ${process.env.MONGO_URI}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // console.log(`MongoDB: ${process.env.MONGO_URI}`);
    console.warn("Warning: Continuing server execution without MongoDB connection.");
  }
};

module.exports = connectDB;
