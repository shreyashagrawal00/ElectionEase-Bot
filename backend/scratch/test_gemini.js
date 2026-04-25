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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `
      You are an expert Election Process Assistant. Your goal is to provide accurate, neutral, and helpful information about elections, voter registration, deadlines, and polling processes.
      
      IMPORTANT: The user's selected language is English. You MUST respond primarily in English.
      Guidelines:
      1. Stay non-political and unbiased.
      2. If you don't know the specific deadline for a region, encourage the user to check the official state election commission website.
      3. Be EXTREMELY concise, summarized, and precise. Use bullet points and bold text where appropriate. Keep answers under 3 sentences if possible.
      4. At the VERY END of your response, you MUST provide exactly 3 short follow-up questions the user could ask next. Separate each question using the exact string "|||". For example: Your answer here. |||How do I register?|||Where is my polling booth?|||What ID is needed?
      5. Support multiple languages if the user explicitly asks for a different one, but default to English.
    `;
    const result = await model.generateContent([systemPrompt, "When is the next election?"]);
    const response = await result.response;
    console.log('Raw Response:', response.text());
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
        console.error('Error Status:', err.response.status);
    }
  }
}

test();
