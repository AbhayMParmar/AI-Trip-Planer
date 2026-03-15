const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tripName: String,
    destination: {
        city: String,
        country: String
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    duration: Number,
    totalEstimatedCost: Number,
    currency: String,
    highlights: [String],
    days: [{
        day: Number,
        theme: String,
        activities: [{
            time: String,
            title: String,
            description: String,
            location: String,
            cost: Number,
            duration: String
        }],
        meals: mongoose.Schema.Types.Mixed
    }],
    accommodations: [{
        name: String,
        type: { type: String },
        pricePerNight: Number,
        description: String,
        rating: Number
    }],
    budgetBreakdown: {
        accommodation: Number,
        food: Number,
        activities: Number,
        transport: Number
    },
    travelTips: [String],
    status: {
        type: String,
        enum: ['draft', 'planned', 'completed', 'cancelled'],
        default: 'planned'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trip', tripSchema);