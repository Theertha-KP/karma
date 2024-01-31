const mongoose = require('mongoose');
const dotenv=require('dotenv').config()
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection error:', err.message);
    }
};
// const sessionSecret="amodisgreat"
module.exports = dbConnect; 