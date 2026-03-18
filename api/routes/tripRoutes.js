const express = require('express');
const router = express.Router();
const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    getUserTrips
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// All trip routes are protected
router.use(protect);

router.route('/')
    .post(createTrip)
    .get(getUserTrips);

router.route('/:id')
    .get(getTripById)
    .put(updateTrip)
    .delete(deleteTrip);

module.exports = router;