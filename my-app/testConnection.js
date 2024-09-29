// testConnection.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI; // Removed quotes and semicolon

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

console.log('MONGODB_URI:', MONGODB_URI ? 'Loaded' : 'Not Loaded');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connection successful');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
