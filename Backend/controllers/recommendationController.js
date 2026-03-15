const Place = require('../models/Place');
const Recommendation = require('../models/Recommendation');
const aiService = require('../services/aiService');
const transportService = require('../services/transportService');

exports.generateRecommendations = async (req, res) => {
    try {
        const { source, destination, duration, transport, style, budget, interests, travelers, mustVisit, module } = req.body;

        // Fetch Flight, Train, Hotel and Restaurant details based on transport type and locations
        let transportDetails = { flights: [], trains: [], hotels: [], restaurants: [], roadTrip: null };

        try {
            if (transport === 'flight') {
                transportDetails.flights = await transportService.getFlightDetails(source, destination);
            } else if (transport === 'train') {
                transportDetails.trains = await transportService.getTrainDetails(source, destination);
            } else if (transport === 'car' || transport === 'bike') {
                transportDetails.roadTrip = await transportService.getRoadDistance(source, destination);
            }

            // Always fetch hotels and restaurants for the destination city
            transportDetails.hotels = await transportService.getHotelDetails(destination);
            transportDetails.restaurants = await transportService.getRestaurantDetails(destination);
        } catch (transErr) {
            console.warn('Discovery data fetch failed:', transErr.message);
        }

        // Fetch Destination Overview and Weather
        const destinationInfo = await aiService.getDestinationOverview(destination);
        // Add real reviews from maps-data RapidAPI
        destinationInfo.reviews = await transportService.getDestinationReviews(destination);
        
        let weather = await transportService.getWeatherData(destination);

        // Fallback to AI-simulated weather if live API fails
        if (!weather) {
            weather = await aiService.getWeather(destination);
        }

        // Fetch real-time web context for better accuracy (especially for international destinations like Thailand)
        const webContext = await transportService.getSearchContext(destination);

        // Use AI Service to generate detailed itinerary
        const aiItinerary = await aiService.generateItinerary(
            source,
            destination,
            duration,
            transport,
            style,
            interests,
            budget,
            travelers,
            mustVisit,
            module,
            transportDetails,
            webContext // Pass web context to AI
        );

        // Attach transport details and destination info to response for frontend
        const finalItinerary = {
            ...aiItinerary,
            transportData: transportDetails,
            destinationInfo,
            weather,
            query: { source, destination, duration, transport, style, budget, interests, travelers }
        };

        // Save recommendation history for the user (only if logged in)
        if (req.user) {
            try {
                const recommendation = new Recommendation({
                    user: req.user.id,
                    query: { source, destination, duration, transport, style, budget, interests, travelers },
                    results: finalItinerary
                });
                await recommendation.save();
            } catch (dbErr) {
                console.warn('History not saved - DB connection failed');
            }
        }

        res.json(finalItinerary);
    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ message: error.message || 'Failed to generate recommendations' });
    }
};

exports.getPlaces = async (req, res) => {
    try {
        const { type, city, page = 1, limit = 10 } = req.query;

        const query = {};
        if (type) query.type = type;
        if (city) query['location.city'] = new RegExp(city, 'i');

        const places = await Place.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ rating: -1 });

        const total = await Place.countDocuments(query);

        res.json({
            places,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPlaceById = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.json(place);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchPlaces = async (req, res) => {
    try {
        const { q } = req.query;
        const places = await Place.find({
            $or: [
                { name: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
                { tags: new RegExp(q, 'i') }
            ]
        }).limit(20);

        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLiveWeather = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) return res.status(400).json({ message: 'City is required' });
        const weather = await transportService.getWeatherData(city);
        if (!weather) {
            const aiWeather = await aiService.getWeather(city);
            return res.json({ ...aiWeather, liveUpdated: true });
        }
        res.json({ ...weather, liveUpdated: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCityGuide = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) return res.status(400).json({ message: 'City is required' });

        const guideData = await aiService.getDestinationOverview(city);
        guideData.reviews = await transportService.getDestinationReviews(city);

        res.json(guideData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBudgetEstimate = async (req, res) => {
    try {
        const { source, destination, duration, transport, style, travelers } = req.body;
        if (!destination || !duration) {
            return res.status(400).json({ message: 'Destination and duration are required' });
        }

        const budgetData = await aiService.estimateBudget(
            source,
            destination,
            duration,
            transport,
            style,
            travelers || { adults: 1, children: 0 }
        );

        res.json(budgetData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};