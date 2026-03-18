const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
    try {
        let { message, model, history } = req.body;
        const uploadedFile = req.file;

        // Clean history: alternating user/assistant and non-empty content
        const cleanHistory = [];
        // Ensure history is an array, parse if string
        if (typeof history === 'string') {
            try {
                history = JSON.parse(history);
            } catch (e) {
                history = [];
            }
        }
        if (!Array.isArray(history)) {
            history = [];
        }

        history.forEach(h => {
            const role = h.role === 'model' ? 'assistant' : h.role;
            if ((role === 'user' || role === 'assistant') && h.content && typeof h.content === 'string' && h.content.trim()) {
                if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === role) {
                    // Merge same-role messages
                    cleanHistory[cleanHistory.length - 1].content += '\n' + h.content;
                } else {
                    cleanHistory.push({ role, content: h.content.trim() });
                }
            }
        });

        if (model === 'groq') {
            // Groq Integration
            const isVisionModel = uploadedFile && uploadedFile.mimetype.startsWith('image/');
            const groqModel = isVisionModel ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';
            
            const messages = [
                { role: 'system', content: 'You are an AI travel assistant for TravelAI. Help users with travel planning, tips, and general questions.' },
                ...cleanHistory
            ];

            // Add current message
            if (isVisionModel) {
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'text', text: message || 'Analyze this image.' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString('base64')}`
                            }
                        }
                    ]
                });
            } else {
                messages.push({ role: 'user', content: message || 'Hello' });
            }

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: groqModel,
                messages,
                temperature: 0.7,
                max_tokens: 1024
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return res.json({ reply: response.data.choices[0].message.content });
        } else {
            // Google Gemini Integration using Official SDK
            const geminiModel = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: "You are an AI travel assistant for TravelAI. Help users with travel planning, tips, and general questions."
            });

            // Format history for Gemini SDK
            const geminiHistory = cleanHistory.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }]
            }));

            // Gemini strictly requires history to start with 'user'
            if (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
                geminiHistory.shift();
            }

            const chat = geminiModel.startChat({
                history: geminiHistory,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            });

            // Prepare prompt parts
            const promptParts = [message || 'Hello'];
            if (uploadedFile && uploadedFile.mimetype.startsWith('image/')) {
                promptParts.push({
                    inlineData: {
                        data: uploadedFile.buffer.toString('base64'),
                        mimeType: uploadedFile.mimetype
                    }
                });
            }

            const result = await chat.sendMessage(promptParts);
            const response = await result.response;
            const reply = response.text();

            return res.json({ reply });
        }
    } catch (error) {
        console.error('Chat Error Details:', error.response?.data || error.message);
        
        // If it's a rate limit or busy error from the provider
        if (error.response?.status === 429) {
            return res.status(429).json({ message: 'AI model is currently overloaded. Please try again in 30 seconds.' });
        }

        res.status(500).json({ message: 'AI Assistant encountered an error. Please try again later.' });
    }
};
