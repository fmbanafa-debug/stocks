const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (request, response) => {
  // 1. Allow the frontend to talk to this backend (CORS)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 2. Check for API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing in Vercel Environment Variables");
    return response.status(500).json({ error: 'Server API Key not configured' });
  }

  try {
    const { prompt, image } = request.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let result;
    if (image) {
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: "image/png"
            }
        };
        result = await model.generateContent([prompt, imagePart]);
    } else {
        result = await model.generateContent(prompt);
    }

    const text = result.response.text();
    return response.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return response.status(500).json({ error: error.message });
  }
};
