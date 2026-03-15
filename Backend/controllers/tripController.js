const Trip = require('../models/Trip');

exports.createTrip = async (req, res) => {
    try {
        const tripData = {
            ...req.body,
            user: req.user.id
        };

        const trip = await Trip.create(tripData);
        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('recommendations.hotels recommendations.restaurants recommendations.attractions');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrips = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const trips = await Trip.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Trip.countDocuments();

        res.json({
            trips,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};