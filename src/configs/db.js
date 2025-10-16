// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // use the environment variable from your .env file
    const mongoURI = process.env.MONGO_URI;
console.log(mongoURI)
    if (!mongoURI) {
      throw new Error("❌ MONGO_URI is missing in your .env file");
    }

    // connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1); // stop the app if DB fails
  }
};

module.exports = connectDB;
