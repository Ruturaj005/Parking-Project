const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/smartpark');
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ email: 'john@example.com' });
        console.log("User:", user);
        if (user) {
            const isMatch = await bcrypt.compare('password123', user.password);
            console.log("Password Match:", isMatch);
        }
    } catch (e) {
        console.log("Error:", e);
    } finally {
        mongoose.disconnect();
    }
}
test();
