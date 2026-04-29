const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB Atlas.
 * Provides specific guidance for common connection failures (like IP whitelisting).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('\n❌ MongoDB Connection Error:');
    console.error(err.message);
    
    if (err.message.includes('MongooseServerSelectionError') || err.message.includes('ETIMEDOUT')) {
      console.error('\n💡 Troubleshooting Tip:');
      console.error('It looks like your IP address might not be whitelisted on MongoDB Atlas.');
      console.error('1. Go to: https://cloud.mongodb.com/');
      console.error('2. Navigate to "Network Access"');
      console.error('3. Click "Add IP Address" and select "Allow Access From Anywhere" (0.0.0.0/0) or add your current IP.');
    }
    
    // In production, we want to fail fast. In dev, we log and exit to ensure the user fixes the config.
    process.exit(1);
  }
};

module.exports = connectDB;
