const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['hotel', 'restaurant', 'attraction', 'transport'],
        required: true
    },
    category: [String],
    location: {
        city: String,
        country: String,
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    description: String,
    priceLevel: {
        type: Number,
        min: 1,
        max: 4
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: Number,
    amenities: [String],
    cuisine: [String],
    openingHours: {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    },
    contact: {
        phone: String,
        website: String,
        email: String
    },
    images: [String],
    tags: [String],
    popularity: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

placeSchema.index({ location: '2dsphere' });
placeSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Place', placeSchema);