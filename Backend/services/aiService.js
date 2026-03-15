const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Official Gemini (as backup or primary for top-tier quality)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

class AITravelService {

  async generateItinerary(source, destination, duration, transport, style, interests, budget, travelers, mustVisit = [], module = 'expedition', transportDetails = { flights: [], trains: [] }, webContext = "") {
    const prompt = this.buildItineraryPrompt(source, destination, duration, transport, style, interests, budget, travelers, mustVisit, module, transportDetails, webContext);
    
    // Core system prompt ensuring we get JSON and act as a concise concierge
    const systemPrompt = "You are an elite AI travel concierge. Create highly detailed, luxury-feeling, and practical travel itineraries. Always return a valid JSON object.";
    
    // Combining system and user prompt since RapidAPI might not support system_instructions field directly
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    try {
      // PRIMARY: Groq Cloud AI (Llama 3.3 70B Versatile)
      const options = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        data: {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4096
        }
      };

      const result = await axios.request(options);
      const responseText = result.data?.choices?.[0]?.message?.content || '';
      return JSON.parse(responseText);
    } catch (groqError) {
      console.warn('Groq Service Error, falling back to Gemini:', groqError.message);
      
      try {
        // SECONDARY: Fallback to Gemini Pro RapidAPI
        const options = {
          method: 'POST',
          url: 'https://gemini-pro-ai.p.rapidapi.com/',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'gemini-pro-ai.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '74cd5fca30msh4314cb6ac985810p11ab60jsn267987e5fb02'
          },
          data: {
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
          }
        };

        const result = await axios.request(options);
        const responseText = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("Unable to extract JSON from Gemini");
      } catch (geminiError) {
        console.warn('Gemini Pro Error, trying Official Gemini SDK:', geminiError.message);
        try {
          // TERTIARY: Fallback to Official Gemini SDK
          const geminiModel = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: { 
              response_mime_type: "application/json",
              max_output_tokens: 4096
            }
          });
          
          const result = await geminiModel.generateContent(fullPrompt);
          const responseText = result.response.text();
          
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
             return JSON.parse(jsonMatch[0]);
          }
          throw new Error("Unable to extract JSON from Official Gemini response");
        } catch (officialError) {
          console.error('All AI Services Failed. Using mock fallback:', officialError.message);
          return this.generateMockItinerary(source, destination, duration, transport, style, interests, budget, travelers);
        }
      }
    }
  }

  buildItineraryPrompt(source, destination, duration, transport, style, interests, budget, travelers, mustVisit = [], module = 'expedition', transportDetails = { flights: [], trains: [] }, webContext = "") {
    let mustVisitText = mustVisit.length > 0 ? `Include these MUST-VISIT places: ${mustVisit.join(', ')}.` : '';

    let transportContext = "";
    if (transport === 'flight' && transportDetails.flights?.length > 0) {
      transportContext = `Available Flights found: ${JSON.stringify(transportDetails.flights.slice(0, 3))}. Please mention these real flight options in the day 1 arrival or arrival summary.`;
    } else if (transport === 'train' && transportDetails.trains?.length > 0) {
      transportContext = `Available Trains found from ${source} to ${destination}: ${JSON.stringify(transportDetails.trains.slice(0, 5))}. Please mention these real train options in the travel planning.`;
    }

    let hotelContext = "";
    if (transportDetails.hotels?.length > 0) {
      hotelContext = `Recommended real hotels in ${destination} found via API: ${JSON.stringify(transportDetails.hotels.slice(0, 5))}. Please use these real names and details in the 'accommodations' section.\n`;
    }

    let restaurantContext = "";
    if (transportDetails.restaurants?.length > 0) {
      restaurantContext = `Recommended real restaurants in ${destination} found via API: ${JSON.stringify(transportDetails.restaurants.slice(0, 5))}. Please use these real names and cuisines in the 'meals' section of the itinerary.\n`;
    }

    let moduleInstruction = "";
    if (module === 'gastronomy') {
      moduleInstruction = `FOCUS HEAVILY on Gastronomy and Dining. Provide the best restaurant recommendations for breakfast, lunch, and dinner. The 'activities' should actually be food-related experiences like food tours, cooking classes, or visiting local markets.`;
    } else if (module === 'sanctuary' || style === 'luxury') {
      moduleInstruction = `FOCUS HEAVILY on Accommodations and Stays. Provide detailed luxury/boutique hotel options in the 'accommodations' section. The 'activities' should be relaxed and centered around the hotel area or spa/wellness.`;
    }

    let webDataInstruction = "";
    if (webContext) {
      // Limit web context to avoid prompt bloating
      const limitedContext = typeof webContext === 'string' ? webContext.slice(0, 3000) : JSON.stringify(webContext).slice(0, 3000);
      webDataInstruction = `REAL-TIME WEB DATA SEARCH CONTEXT (Use this to provide highly accurate and updated places for ${destination}):\n${limitedContext}\n\n`;
    }

    return `${webDataInstruction}${transportContext}${hotelContext}${restaurantContext}${mustVisitText}
Create a comprehensive ${duration}-day travel plan for a trip to ${destination}.
    Departure from: ${source || 'unspecified location'}
    
Travel Method: ${transport.toUpperCase()}
Travel Style: ${style.toUpperCase()}
Travelers: ${travelers.adults} adults, ${travelers.children} children
Interests/Experiences: ${interests.join(', ')}
Module Focus: ${module.toUpperCase()}

IMPORTANT: You must act as a LOCAL EXPERT and VETERAN TRAVELER. For the destination "${destination}", you MUST include only REAL, famous, and geographically accurate landmarks, streets, and neighborhoods. 
DO NOT hallucinate places. If the destination is popular (like Mumbai, London, Paris, etc.), use the most iconic spots (e.g., Marine Drive for Mumbai, Eiffel Tower for Paris). If it's a niche location, use verified local gems.

    ${budget ? `A budget of ₹${budget} has been specified.` : 'No specific constraints were provided.'} 
    Please calculate a highly accurate REALISTIC ESTIMATED BUDGET in INR for this entire trip. 
    Even if a budget was provided, provide your own expert estimation based on current market trends for ${destination}, Travel Style (${style}), and travelers count.
    Provide the final total in the "totalEstimatedCost" field as a numerical value (integer).

IMPORTANT: Each day MUST have a distinct, unique theme to avoid repetition. Ensure the activities and descriptions reflect these unique daily focuses with specific, real local names.

IMPORTANT FOR PRICING:
- For each meal in the 'meals' section, include a 'cost' field with a realistic approximate cost in INR (e.g., 450). DO NOT use the same price for all restaurants; vary them based on the restaurant's quality and cuisine.
- For each hotel in 'accommodations', include a 'pricePerNight' field with a realistic approximate cost in INR (e.g., 5150). All prices must be integers representing INR. DO NOT include the currency symbol (₹) in the JSON values.

Return the result as a JSON object with the following structure:
{
  "tripName": "A catchy name for the trip",
  "totalEstimatedCost": "Total cost in INR",
  "destination": "${destination}",
  "duration": "${duration} Days",
  "days": [
    {
      "day": 1,
      "theme": "Theme for the day",
      "activities": [
        { "time": "9:00 AM", "activity": "Activity name", "description": "Short description" }
      ],
      "meals": {
        "breakfast": { "name": "Restaurant name", "cuisine": "Cuisine type", "cost": 450, "description": "Reason for recommendation" },
        "lunch": { "name": "Restaurant name", "cuisine": "Cuisine type", "cost": 850, "description": "Reason for recommendation" },
        "dinner": { "name": "Restaurant name", "cuisine": "Cuisine type", "cost": 1200, "description": "Reason for recommendation" }
      }
    }
  ],
  "accommodations": [
    { "name": "Hotel name", "type": "Luxury/Boutique/Budget", "pricePerNight": 5000, "description": "Why it fits the trip" }
  ],
  "packingList": ["Essential item 1", "Essential item 2"],
  "travelTips": ["Tip 1", "Tip 2"]
}`;
  }

  generateMockItinerary(source, destination, duration, transport, style, interests, budget, travelers) {
    return {
      tripName: `${destination} ${style} Escape`,
      totalEstimatedCost: 45000,
      destination: destination,
      duration: `${duration} Days`,
      days: Array.from({ length: parseInt(duration) || 3 }, (_, i) => ({
        day: i + 1,
        theme: i === 0 ? "Arrival & Exploration" : i === 1 ? "City Highlights" : "Local Vibe & Departure",
        activities: [
          { time: "10:00 AM", activity: `Visit ${destination} Main Square`, description: "Start your journey at the heart of the city." },
          { time: "2:00 PM", activity: "Local Market Tour", description: "Discover unique local crafts and souvenirs." },
          { time: "7:00 PM", activity: "Sunset Walk", description: "Relax with a peaceful evening stroll." }
        ],
        meals: {
          breakfast: { name: "Morning Delights", cuisine: "Local", cost: 380, description: "Best rated breakfast spot." },
          lunch: { name: "City Bistro", cuisine: "Contemporary", cost: 820, description: "Perfect for a quick yet tasty lunch." },
          dinner: { name: "Starry Night", cuisine: "Fine Dining", cost: 1650, description: "An elegant end to your day." }
        }
      })),
      accommodations: [{ name: "Central Plaza Hotel", type: style, pricePerNight: 5800, description: `Perfectly matches your ${style} preference.` }],
      packingList: ["Comfortable shoes", "Dynamic weather clothing", "Camera", "Power bank"],
      travelTips: [
        "Use local ride-sharing apps for fair pricing.",
        "Always carry a reusable water bottle to stay hydrated.",
        "Dress modestly when visiting religious sites."
      ]
    };
  }

  async getDestinationOverview(destination) {
    const prompt = `Give a concise travel overview for ${destination}. 
Include:
1. Famous Places (3-4 items)
2. Best Time to Visit
3. Cultural Vibe
4. Typical Weather for the current season (March)
Return as a clean JSON object with keys: famousPlaces (array), bestTime, vibe, currentSeasonWeather.`;

    try {
      // PRIMARY: Groq Cloud AI (Llama 3.3 70B Versatile)
      const options = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        data: {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: 'system', content: "You are a travel expert. Always return data in strict JSON format." },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }
      };

      const result = await axios.request(options);
      const text = result.data?.choices?.[0]?.message?.content || '';
      return JSON.parse(text);
    } catch (groqError) {
      console.warn('Groq Overview Error, trying Gemini:', groqError.message);
      
      try {
        // SECONDARY: Gemini Pro RapidAPI
        const options = {
          method: 'POST',
          url: 'https://gemini-pro-ai.p.rapidapi.com/',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'gemini-pro-ai.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '74cd5fca30msh4314cb6ac985810p11ab60jsn267987e5fb02'
          },
          data: {
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          }
        };

        const result = await axios.request(options);
        const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("JSON parsing failed in Gemini");
      } catch (geminiError) {
        console.warn('Gemini Pro Overview Error, trying Official SDK:', geminiError.message);
        try {
          // TERTIARY: Official Gemini SDK
          const geminiModel = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: { response_mime_type: "application/json" }
          });
          const result = await geminiModel.generateContent(prompt);
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
          throw new Error("JSON parsing failed in Official SDK");
        } catch (officialError) {
          console.error('All Overview APIs Failed. Using dynamic fallback:', officialError.message);
          
          // Dynamic fallback for various cities
          const fallbacks = {
            'surat': {
              famousPlaces: ["Dumas Beach", "Gopi Talav", "Surat Castle", "Dutch Garden"],
              bestTime: "October to March",
              vibe: "Dynamic, industrial yet culturally rich, known as Silk City.",
              currentSeasonWeather: "Hot and Dry, 32°C"
            },
            'mumbai': {
              famousPlaces: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Chhatrapati Shivaji Terminus"],
              bestTime: "November to February",
              vibe: "Fast-paced, vibrant, the city that never sleeps.",
              currentSeasonWeather: "Humid and Warm, 30°C"
            }
          };
          
          return fallbacks[destination?.toLowerCase()] || {
            famousPlaces: [`${destination} Landmark 1`, `${destination} Landmark 2`, `${destination} Landmark 3`],
            bestTime: "October to March",
            vibe: "Unique and welcoming atmosphere",
            currentSeasonWeather: "Seasonal conditions apply"
          };
        }
      }
    }
  }

  async getWeather(destination) {
    try {
      // Use AI to predict realistic seasonal weather for the destination
      const overview = await this.getDestinationOverview(destination);
      const temp = overview && overview.currentSeasonWeather ? (parseInt(overview.currentSeasonWeather.match(/\d+/)?.[0]) || 28) : 28;
      const condition = overview && overview.currentSeasonWeather ? (overview.currentSeasonWeather.split(',')[0] || "Clear") : "Clear";
      
      return {
        temp,
        condition,
        humidity: 45,
        windSpeed: 12,
        forecast: [
          { time: new Date().toISOString(), temp, condition },
          { time: new Date(Date.now() + 10800000).toISOString(), temp, condition },
          { time: new Date(Date.now() + 21600000).toISOString(), temp: temp - 2, condition }
        ]
      };
    } catch {
      return { 
        temp: 28, 
        condition: "Clear", 
        humidity: 40,
        windSpeed: 10,
        forecast: [] 
      };
    }
  }

  async estimateBudget(source, destination, duration, transport, style, travelers) {
    const prompt = `You are a professional travel cost estimator. Calculate a realistic approximate budget in INR for a trip with these parameters:
    Destination: ${destination}
    Duration: ${duration} days
    Transport: ${transport}
    Travel Style: ${style}
    Travelers: ${travelers.adults} adults, ${travelers.children} children

    Consider:
    1. ${transport} costs from ${source} to ${destination}
    2. Accommodation for ${duration} nights for ${style} tier
    3. Daily meals and local transport
    4. Popular sightseeing fees in ${destination}

    Return a clean JSON object with:
    "total" (integer, total cost in INR),
    "breakdown" (object with keys: travel, stay, food, activities),
    "currency" ("INR"),
    "confidence" ("high/medium/low")`;

    try {
      const options = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        data: {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: 'system', content: "You are a travel budget expert. Always return strict JSON." },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }
      };

      const result = await axios.request(options);
      const text = result.data?.choices?.[0]?.message?.content || '';
      return JSON.parse(text);
    } catch (error) {
      console.error('Groq Budget Error:', error.message);
      // Fallback calculation similar to frontend logic
      const perDay = style === 'luxury' ? 15000 : style === 'comfort' ? 7000 : 3000;
      const total = duration * perDay * (travelers.adults + (travelers.children * 0.5));
      return {
        total: Math.round(total),
        breakdown: { travel: 'Dynamic', stay: 'Estimated', food: 'Daily', activities: 'Average' },
        currency: "INR",
        confidence: "fallback"
      };
    }
  }
}

module.exports = new AITravelService();
