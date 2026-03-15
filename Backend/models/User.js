const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    preferences: {
        budget: {
            type: String,
            enum: ['budget', 'moderate', 'luxury'],
            default: 'moderate'
        },
        interests: [String],
        travelStyle: {
            type: String,
            enum: ['adventure', 'relaxation', 'cultural', 'family', 'solo'],
            default: 'cultural'
        },
        aiModel: {
            type: String,
            default: 'gemini'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);