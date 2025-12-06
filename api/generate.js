const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(request, response) {
  // 1. Setup headers to allow your HTML file to talk to this function
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get your Secret Key from Vercel Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Server API Key not configured' });
  }

  try {
    const { prompt, image } = request.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the flash model which is faster and cheaper
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let result;
    if (image) {
        // Image analysis mode
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: "image/png"
            }
        };
        result = await model.generateContent([prompt, imagePart]);
    } else {
        // Text/Chat mode
        result = await model.generateContent(prompt);
    }

    const text = result.response.text();
    return response.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return response.status(500).json({ error: 'Error processing AI request' });
  }
}

