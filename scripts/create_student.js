require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'lost_found' });
        
        let student = await User.findOne({ username: 'student' });
        
        if (!student) {
            console.log('Creating student user...');
            student = new User({
                username: 'student',
                email: 'student@campustest.edu',
                password: 'studentpassword123',
                isAdmin: false
            });
            await student.save();
        }
        
        console.log(`✅ Student user "${student.username}" is ready.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

createStudent();
