// Import the library (Just like Repo 1)
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // 1. Setup CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. Auth
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use the stable model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const { prompt } = req.body;
        
        // 3. Generate (No long URL needed!)
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({ text: responseText });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
