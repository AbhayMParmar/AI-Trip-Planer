const express = require('express');
const router = express.Router();
const {
    generateRecommendations,
    getPlaces,
    getPlaceById,
    searchPlaces,
    getLiveWeather,
    getCityGuide,
    getBudgetEstimate
} = require('../controllers/recommendationController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Public routes
router.get('/places', getPlaces);
router.get('/places/search', searchPlaces);
router.get('/places/:id', getPlaceById);
router.get('/weather', getLiveWeather);
router.get('/city-guide', getCityGuide);
router.post('/budget-estimate', getBudgetEstimate);

// Optionally Protected routes (accessible to guests)
router.post('/generate', optionalProtect, generateRecommendations);

module.exports = router;