const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database connection (Non-blocking for faster startup)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast if DB is down
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.log('MongoDB connection skipped/failed: Application running in Resilient Mode');
    }
};
console.log('Starting server initialization...');
connectDB();

// Routes
console.log('Loading routes...');
app.use('/api/auth', require('../Backend/routes/authRoutes'));
app.use('/api/trips', require('../Backend/routes/tripRoutes'));
app.use('/api/recommendations', require('../Backend/routes/recommendationRoutes'));
app.use('/api/favorites', require('../Backend/routes/favoriteRoutes'));
app.use('/api/chatbot', require('../Backend/routes/chatbotRoutes'));
console.log('Routes loaded.');

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is now listening on 0.0.0.0:${PORT}`);
    });
}