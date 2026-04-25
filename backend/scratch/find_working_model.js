const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function findWorkingModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  for (const m of models) {
    try {
      console.log(`Trying ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`✅ SUCCESS with ${m}:`, response.text());
      return;
    } catch (err) {
      console.error(`❌ FAILED with ${m}:`, err.message);
    }
  }
}

findWorkingModel();
