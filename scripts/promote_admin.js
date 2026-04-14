require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'lost_found' });
        
        // Find existing user or create one
        let admin = await User.findOne({ username: 'admin' });
        
        if (!admin) {
            console.log('Creating new admin user...');
            admin = new User({
                username: 'admin',
                email: 'admin@campustest.edu',
                password: 'adminpassword123',
                isAdmin: true
            });
        } else {
            console.log('Promoting existing user to Admin...');
            admin.isAdmin = true;
        }

        await admin.save();
        console.log(`✅ User "${admin.username}" is now an Admin.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

promoteUser();
