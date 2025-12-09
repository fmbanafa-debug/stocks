module.exports = async (request, response) => {
    // 1. CORS Setup
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // 2. Get the Hidden Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return response.status(500).json({ error: 'Server API Key not configured' });
    }

    try {
        const { prompt, image } = request.body;
        
        // 3. THE URL - We use 'gemini-1.5-flash-latest' and trim the key to fix the 404 error
        // The .trim() fixes issues if you accidentally copied a space in Vercel
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey.trim()}`;

        // Prepare the body for Google
        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt }
                ]
            }]
        };

        // If there is an image, add it to the parts
        if (image) {
            requestBody.contents[0].parts.push({
                inlineData: {
                    mimeType: "image/png",
                    data: image
                }
            });
        }

        // 4. Call Google directly (No library needed)
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await googleResponse.json();

        // Check if Google sent an error
        if (!googleResponse.ok) {
            console.error("Google API Error:", JSON.stringify(data));
            return response.status(googleResponse.status).json({ 
                error: data.error?.message || "Error from Google API" 
            });
        }

        // Extract the text
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return response.status(200).json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        return response.status(500).json({ error: error.message });
    }
};
