const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the high level SDK that I recall offhand, 
    // but we can try to hit the discovery endpoint or just try 'gemini-1.0-pro'
    console.log("Checking gemini-1.0-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result = await model.generateContent("Hi");
    console.log("Success with gemini-1.0-pro");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
