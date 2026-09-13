const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany(); // clear existing admins
        
        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'admin@sudharafinance.com',
            password: 'password123', // will be hashed by pre-save hook
            role: 'ADMIN'
        });

        console.log(`Admin user created: ${adminUser.email} / password123`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
