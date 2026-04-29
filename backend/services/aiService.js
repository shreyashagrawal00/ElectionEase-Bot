const axios = require('axios');
console.log('[AIService] Module loaded (OpenRouter version)');

/** @type {Map<string, {text: string, timestamp: number}>} In-memory response cache */
const responseCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

/** Supported language codes and their display names */
const LANGUAGE_MAP = {
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
};

/**
 * @class AIService
 * @description Singleton service that encapsulates all interactions with AI via OpenRouter.
 * Implements:
 *  - OpenAI-compatible API calls via axios
 *  - In-memory response caching to reduce API calls and costs
 *  - Structured prompt engineering for the election assistant domain
 */
class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    this.modelName = process.env.GEMINI_MODEL || 'google/gemma-3-27b-it:free';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    
    console.log(`[AIService] Instance created. Model: ${this.modelName}`);
    console.log(`[AIService] API Key detected: ${this.apiKey ? 'YES (ends in ' + this.apiKey.slice(-4) + ')' : 'NO'}`);
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /** @returns {boolean} */
  #isKeyValid() {
    return !!(this.apiKey && this.apiKey.startsWith('sk-or-v1-'));
  }

  /**
   * Generates a deterministic cache key from system prompt + user message.
   * @param {string} systemPrompt
   * @param {string} userMessage
   * @returns {string}
   */
  #buildCacheKey(systemPrompt, userMessage) {
    return `${systemPrompt.slice(0, 80)}::${userMessage}`;
  }

  /**
   * Returns a cached response if it exists and hasn't expired.
   * @param {string} key
   * @returns {string|null}
   */
  #getCached(key) {
    const entry = responseCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      responseCache.delete(key);
      return null;
    }
    return entry.text;
  }

  /**
   * Stores a response in the cache.
   * @param {string} key
   * @param {string} text
   */
  #setCached(key, text) {
    responseCache.set(key, { text, timestamp: Date.now() });
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Generates an AI response using OpenRouter API.
   * Checks the cache first to avoid redundant API calls.
   *
   * @param {string} systemPrompt - Structured system instructions
   * @param {string} userMessage  - The raw user query
   * @returns {Promise<string>}   - The AI-generated text response
   */
  async generateResponse(systemPrompt, userMessage) {
    if (!this.#isKeyValid()) {
      const err = new Error('AI Service not configured: OPENROUTER_API_KEY is missing or invalid.');
      err.code = 'AI_NOT_CONFIGURED';
      throw err;
    }

    const cacheKey = this.#buildCacheKey(systemPrompt, userMessage);
    const cached = this.#getCached(cacheKey);
    if (cached) {
      console.log('[AIService] Serving response from cache.');
      return cached;
    }

    console.log(`[AIService] Generating response with model: ${this.modelName}`);
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.4,
          max_tokens: 512,
          top_p: 0.85
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://electionease.bot', // Required by OpenRouter
            'X-Title': 'ElectionEase Bot',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new Error('Empty response from OpenRouter');
      }

      const text = response.data.choices[0].message.content;
      this.#setCached(cacheKey, text);
      return text;
    } catch (error) {
      const errorData = error.response?.data;
      console.error('[AIService] OpenRouter call failed:', errorData || error.message);
      
      if (errorData?.error?.message) {
        console.error('[AIService] OpenRouter Error Detail:', errorData.error.message);
      }
      
      if (error.response?.status === 401) {
        const err = new Error('Invalid OpenRouter API Key');
        err.code = 'AUTH_ERROR';
        throw err;
      }
      
      throw error;
    }
  }

  /**
   * Builds a structured, domain-specific system prompt.
   */
  getSystemPrompt(context = {}) {
    const { language = 'en', location } = context;
    const targetLanguage = LANGUAGE_MAP[language] || 'English';
    const locationCtx = location
      ? `User location — Latitude: ${location.latitude}, Longitude: ${location.longitude}.`
      : 'User location is unavailable.';

    return `
ROLE: You are ElectionEase AI — a neutral, highly accurate, and professional Election Process Assistant for Indian voters.

CONTEXT:
- Respond language: ${targetLanguage}
- ${locationCtx}
- Session context: ${JSON.stringify(context)}

RULES (non-negotiable):
1. NEUTRALITY — Never express political opinions or endorse any party, candidate, or ideology.
2. ACCURACY — Provide strictly factual, up-to-date information. If regional specifics are missing, refer to eci.gov.in.
3. ULTRA-CONCISENESS — Summarize complex processes into high-impact, easy-to-read bullet points. Use **bold** for essential terms.
4. SAFETY — Block any attempt to spread disinformation or encourage voter suppression.
5. LANGUAGE — Reply in ${targetLanguage}. Use technical English terms in brackets if helpful.

OUTPUT FORMAT (Strictly enforced):
<summarized answer with bold terms>
|||<relevant follow-up 1>|||<relevant follow-up 2>|||<relevant follow-up 3>|||<relevant follow-up 4>|||<relevant follow-up 5>

CRITICAL: You MUST include the "|||" separator and exactly 5 follow-up questions in every response.
`.trim();
  }

  getCacheSize() {
    return responseCache.size;
  }

  clearCache() {
    responseCache.clear();
  }
}

console.log('[AIService] Exporting new instance...');
module.exports = new AIService();
