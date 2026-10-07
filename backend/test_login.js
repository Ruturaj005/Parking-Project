const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

async function test() {
    await connectDB();
    const user = await User.findOne({ email: 'john@example.com' });
    if (!user) {
        console.log('User not found');
        process.exit(1);
    }
    console.log('User found:', user.email);
    console.log('User hashed password:', user.password);
    
    const isMatch = await user.matchPassword('password123');
    console.log('Password match:', isMatch);
    
    process.exit(0);
}

test();
