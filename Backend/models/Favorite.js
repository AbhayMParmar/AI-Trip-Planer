const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    notes: String,
    list: {
        type: String,
        enum: ['wishlist', 'saved', 'visited'],
        default: 'saved'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

favoriteSchema.index({ user: 1, place: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);