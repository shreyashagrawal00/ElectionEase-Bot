const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels in the client SDK like this, 
    // it's usually done via the API directly or checking documentation.
    // However, common model names are gemini-pro, gemini-1.0-pro, gemini-1.5-flash-001
    
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
    
    for (const m of models) {
        try {
            console.log(`Testing model: ${m}`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`SUCCESS with ${m}:`, response.text());
            break;
        } catch (e) {
            console.log(`FAILED with ${m}:`, e.message);
        }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listModels();
