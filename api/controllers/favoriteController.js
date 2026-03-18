const Favorite = require('../models/Favorite');
const Place = require('../models/Place');

exports.addFavorite = async (req, res) => {
    try {
        const { placeId, notes, list } = req.body;

        // Check if place exists
        const place = await Place.findById(placeId);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }

        // Check if already favorited
        const existing = await Favorite.findOne({
            user: req.user.id,
            place: placeId
        });

        if (existing) {
            return res.status(400).json({ message: 'Already in favorites' });
        }

        const favorite = await Favorite.create({
            user: req.user.id,
            place: placeId,
            notes,
            list
        });

        await favorite.populate('place');

        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const { list } = req.query;
        const query = { user: req.user.id };

        if (list) {
            query.list = list;
        }

        const favorites = await Favorite.find(query)
            .populate('place')
            .sort({ createdAt: -1 });

        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            user: req.user.id,
            place: req.params.placeId
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            user: req.user.id,
            place: req.params.placeId
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};