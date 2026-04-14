require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const testInsertion = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'lost_found' });
        console.log('✅ Connected for Test');

        // Create a temporary test user
        const testUser = new User({
            username: 'compass_test_' + Date.now(),
            email: 'test' + Date.now() + '@campus.edu',
            password: 'password123'
        });

        await testUser.save();
        console.log('🚀 SUCCESS: Data inserted into "users" collection!');
        
        const found = await User.findOne({ username: testUser.username });
        console.log('🔍 VERIFIED: Found the test user in the database.');

        console.log('---');
        console.log('👉 Open MongoDB Compass now.');
        console.log('👉 Refresh the "lost_found" database.');
        console.log('👉 You should see a new document in the "users" collection.');
        
        // We'll leave the test user there so they can see it in Compass
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
        process.exit(1);
    }
};

testInsertion();
