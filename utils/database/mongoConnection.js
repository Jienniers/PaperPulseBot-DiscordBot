const mongoose = require('mongoose');

async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports = connectToMongoDB;
