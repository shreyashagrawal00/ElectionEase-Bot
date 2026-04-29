/**
 * @file __tests__/controllers/chatController.test.js
 * @description Unit tests for the chatController (thin orchestrator).
 */

jest.mock('../../services/aiService');

const chatController = require('../../controllers/chatController');
const aiService = require('../../services/aiService');

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildMocks = (body = {}) => {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return { req, res };
};

beforeEach(() => jest.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────

describe('chatController — getChatResponse()', () => {
  test('returns 200 with AI response on success', async () => {
    aiService.getSystemPrompt.mockReturnValue('system prompt');
    aiService.generateResponse.mockResolvedValue('**Voter ID** is required. |||Q1|||Q2|||Q3');

    const { req, res } = buildMocks({ message: 'What do I need?', context: { language: 'en' } });
    await chatController.getChatResponse(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, response: expect.any(String) })
    );
  });

  test('returns 503 when AI service is not configured', async () => {
    aiService.getSystemPrompt.mockReturnValue('prompt');
    const err = new Error('AI Service not configured: GEMINI_API_KEY is missing.');
    aiService.generateResponse.mockRejectedValue(err);

    const { req, res } = buildMocks({ message: 'Any question' });
    await chatController.getChatResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.error).toContain('unavailable');
  });

  test('returns 429 when Gemini rate limit is hit', async () => {
    aiService.getSystemPrompt.mockReturnValue('prompt');
    const err = new Error('429 quota exceeded');
    err.status = 429;
    aiService.generateResponse.mockRejectedValue(err);

    const { req, res } = buildMocks({ message: 'Any question' });
    await chatController.getChatResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('returns 400 when Gemini blocks for safety reasons', async () => {
    aiService.getSystemPrompt.mockReturnValue('prompt');
    const err = new Error('Gemini blocked: SAFETY');
    aiService.generateResponse.mockRejectedValue(err);

    const { req, res } = buildMocks({ message: 'Harmful question' });
    await chatController.getChatResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 for unexpected errors', async () => {
    aiService.getSystemPrompt.mockReturnValue('prompt');
    aiService.generateResponse.mockRejectedValue(new Error('Unknown failure'));

    const { req, res } = buildMocks({ message: 'Any question' });
    await chatController.getChatResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    // Internal error message must not leak in non-development environment
    expect(body.error).not.toContain('Unknown failure');
  });

  test('calls getSystemPrompt with the provided context', async () => {
    aiService.getSystemPrompt.mockReturnValue('hindi system prompt');
    aiService.generateResponse.mockResolvedValue('Response in Hindi |||Q1|||Q2|||Q3');

    const context = { language: 'hi', location: { latitude: 19.07, longitude: 72.87 } };
    const { req, res } = buildMocks({ message: 'मेरा बूथ कहाँ है?', context });
    await chatController.getChatResponse(req, res);

    expect(aiService.getSystemPrompt).toHaveBeenCalledWith(context);
  });
});
