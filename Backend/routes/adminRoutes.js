const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');

// Hardcoded Admin Credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123'; 

// Admin Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Simple token for admin session
        res.json({ success: true, token: 'admin-super-secret-token' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    }
});

// Middleware for Admin verification
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === 'admin-super-secret-token') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized Admin Access' });
    }
};

// Get Dashboard Stats
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTrips = await Trip.countDocuments();
        res.json({ success: true, stats: { totalUsers, totalTrips } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

// Get All Users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

// Delete User
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also delete associated trips
        await Trip.deleteMany({ userId: req.params.id });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

// Get All Trips
router.get('/trips', verifyAdmin, async (req, res) => {
    try {
        const trips = await Trip.find();
        res.json({ success: true, trips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

// Delete Trip
router.delete('/trips/:id', verifyAdmin, async (req, res) => {
    try {
        await Trip.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

module.exports = router;
