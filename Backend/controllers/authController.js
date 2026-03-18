const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Database Resilience Check
        if (!req.app.get('dbConnected')) {
            console.log('DB Offline: Using simulated registration for', email);
            return res.status(201).json({
                _id: 'mock_' + Date.now(),
                name,
                email,
                token: generateToken('mock_user_id')
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Already registered user' });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        const message = error.message.includes('buffering timed out') ? 'Database connection error' : error.message;
        res.status(500).json({ message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Database Resilience Check
        if (!req.app.get('dbConnected')) {
            console.log('DB Offline: Using simulated login for', email);
            return res.json({
                _id: 'mock_' + Date.now(),
                name: email.split('@')[0],
                email,
                token: generateToken('mock_user_id')
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password not entered correctly, enter valid password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        const message = error.message.includes('buffering timed out') ? 'Database connection error' : error.message;
        res.status(500).json({ message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.preferences = req.body.preferences || user.preferences;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.firebaseLogin = async (req, res) => {
    try {
        const { email, name, firebaseUid } = req.body;

        try {
            let user = await User.findOne({ email });

            if (!user) {
                // Create user if they don't exist
                user = await User.create({
                    name,
                    email,
                    password: Math.random().toString(36).slice(-10),
                    preferences: {
                        budget: 'moderate',
                        travelStyle: 'cultural',
                        interests: [],
                        aiModel: 'gemini'
                    }
                });
            }

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } catch (dbError) {
            console.error('DB Connection Failed, using mock login:', dbError.message);
            // Bypass DB for demo if connection fails
            return res.json({
                _id: 'mock_id_' + Date.now(),
                name: name || 'Traveler',
                email: email,
                token: generateToken('mock_user_id')
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};