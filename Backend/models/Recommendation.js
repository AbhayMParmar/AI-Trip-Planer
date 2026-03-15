const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    query: {
        source: String,
        destination: String,
        duration: Number,
        transport: String,
        style: String,
        budget: Number,
        interests: [String],
        travelers: {
            adults: Number,
            children: Number
        }
    },
    results: {
        itinerary: Object,
        hotels: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place'
        }],
        restaurants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place'
        }],
        attractions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place'
        }]
    },
    aiPrompt: String,
    aiResponse: Object,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);