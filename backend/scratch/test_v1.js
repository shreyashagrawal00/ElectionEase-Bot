const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testV1() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a simple way to change API version in the constructor 
    // without using the direct fetch or a different SDK version.
    // But let's try gemini-1.5-flash again.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    const response = await result.response;
    console.log("SUCCESS:", response.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testV1();
