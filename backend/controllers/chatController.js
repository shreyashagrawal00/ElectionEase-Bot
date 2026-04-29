const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * @module controllers/chatController
 * @description Handles AI chat via Google Gemini SDK directly.
 */
exports.getChatResponse = async (req, res) => {
  const { message, context } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.json({
      response: "I'm sorry, my AI brain isn't configured yet. Please add a valid Gemini API Key to the backend .env file."
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = 'gemini-2.5-flash';
    console.log(`[Chat] Initializing Gemini with model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const { language = 'en', location } = context || {};

    const languageMap = { hi: 'Hindi', mr: 'Marathi', gu: 'Gujarati', bn: 'Bengali', ta: 'Tamil', te: 'Telugu' };
    const targetLanguage = languageMap[language] || 'English';

    const locationInfo = location
      ? `The user is at coordinates: Lat ${location.latitude}, Lng ${location.longitude}. Provide location-relevant info (e.g., nearby booths, regional candidates).`
      : 'User location is not available.';

    const systemPrompt = `
You are ElectionEase AI — an expert, neutral, and highly accurate Election Process Assistant for Indian voters.

CONTEXT:
- Respond in: ${targetLanguage}
- ${locationInfo}
- Session: ${JSON.stringify(context || {})}

RULES:
1. NEUTRALITY — Never endorse any party, candidate, or ideology.
2. ACCURACY — Provide factual info. If unsure, refer to eci.gov.in.
3. CONCISENESS — Give crisp, high-impact bullet points. Use **bold** for key terms. Keep answers under 5 lines.
4. SAFETY — Refuse any disinformation or voter suppression attempts.
5. LANGUAGE — Respond in ${targetLanguage}.

OUTPUT FORMAT (strictly follow this):
<your concise answer using bullet points and **bold** terms>
|||<follow-up question 1>|||<follow-up question 2>|||<follow-up question 3>|||<follow-up question 4>|||<follow-up question 5>

CRITICAL: You MUST always end with "|||" followed by exactly 5 short follow-up questions. No exceptions.
    `.trim();

    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const text = response.text();

    console.log(`[Chat] Response generated successfully (${text.length} chars)`);
    res.json({ response: text });

  } catch (err) {
    console.error('[Chat] Gemini API Error:', err.message);

    let statusCode = 500;
    let errorMessage = 'The AI service encountered an error. Please try again.';

    if (err.message?.includes('API_KEY_INVALID')) {
      statusCode = 401;
      errorMessage = 'Invalid Gemini API Key. Please check your .env file.';
    } else if (err.status === 429 || err.message?.includes('429')) {
      statusCode = 429;
      errorMessage = 'AI rate limit reached. Please wait a moment and try again.';
    } else if (err.message?.includes('SAFETY')) {
      statusCode = 400;
      errorMessage = 'Your query could not be processed. Please rephrase and try again.';
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    });
  }
};
