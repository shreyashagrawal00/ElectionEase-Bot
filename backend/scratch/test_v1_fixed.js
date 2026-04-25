const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    // Try to force v1
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    console.log('Testing gemini-1.5-flash with v1...');
    const result = await model.generateContent("Hi");
    const response = await result.response;
    console.log('Success:', response.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
