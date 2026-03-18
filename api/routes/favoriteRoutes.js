const express = require('express');
const router = express.Router();
const {
    addFavorite,
    getFavorites,
    removeFavorite,
    checkFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// All favorite routes are protected
router.use(protect);

router.route('/')
    .post(addFavorite)
    .get(getFavorites);

router.route('/:placeId')
    .delete(removeFavorite)
    .get(checkFavorite);

module.exports = router;