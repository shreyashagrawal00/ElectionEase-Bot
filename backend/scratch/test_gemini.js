const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing with API Key:', apiKey);
  
  if (!apiKey) {
    console.error('No API Key found in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log('Response:', response.text());
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
        console.error('Error Status:', err.response.status);
    }
  }
}

test();
