const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getChatResponse = async (req, res) => {
  const { message, context } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.json({ 
        response: "I'm sorry, my AI brain (Gemini API Key) isn't configured yet. Please add a valid key to the backend .env file. For now, I can tell you that voter registration is crucial! Check the national portal." 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { language } = context || { language: 'en' };
    const systemPrompt = `
      You are an expert Election Process Assistant. Your goal is to provide accurate, neutral, and helpful information about elections, voter registration, deadlines, and polling processes.
      Current context: ${JSON.stringify(context || {})}
      IMPORTANT: The user's selected language is ${language}. You MUST respond primarily in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
      Guidelines:
      1. Stay non-political and unbiased.
      2. If you don't know the specific deadline for a region, encourage the user to check the official state election commission website.
      3. Be concise and friendly.
      4. Support multiple languages if the user explicitly asks for a different one, but default to ${language}.
    `;

    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
};
