const mongoose = require('mongoose');
const Election = require('../models/Election');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Election.countDocuments();
    console.log(`Election count: ${count}`);
    const samples = await Election.find().limit(5);
    console.log('Sample elections:', JSON.stringify(samples, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
