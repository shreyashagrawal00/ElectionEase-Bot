/**
 * @file __tests__/services/aiService.test.js
 * @description Unit tests for the AIService singleton.
 * Mocks the Google Generative AI SDK to avoid real API calls.
 */

// ── Mock Setup (must be before require) ─────────────────────────────────────

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({ generateContent: mockGenerateContent }));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({ getGenerativeModel: mockGetGenerativeModel })),
  HarmCategory: {
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: { BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE' },
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AIService', () => {
  let aiService;

  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'test-api-key-12345';
    // Require after mock is set up so the singleton initialises with the mock
    aiService = require('../../services/aiService');
  });

  afterEach(() => {
    aiService.clearCache();
    mockGenerateContent.mockReset();
  });

  // ── Initialisation ─────────────────────────────────────────────────────────

  describe('init()', () => {
    test('should be idempotent — calling init() twice does not recreate the model', () => {
      const callsBefore = mockGetGenerativeModel.mock.calls.length;
      aiService.init();
      expect(mockGetGenerativeModel.mock.calls.length).toBe(callsBefore);
    });
  });

  // ── generateResponse() ─────────────────────────────────────────────────────

  describe('generateResponse()', () => {
    const makeSuccessResponse = (text) => ({
      response: { text: () => text, promptFeedback: null },
    });

    test('should return the AI-generated text', async () => {
      mockGenerateContent.mockResolvedValue(makeSuccessResponse('Voter ID is required.'));
      const result = await aiService.generateResponse('System', 'What ID do I need?');
      expect(result).toBe('Voter ID is required.');
    });

    test('should cache the response and not call the API twice for identical inputs', async () => {
      mockGenerateContent.mockResolvedValue(makeSuccessResponse('Cached answer'));
      await aiService.generateResponse('System', 'Same question');
      await aiService.generateResponse('System', 'Same question');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    test('should make a fresh API call after cache is cleared', async () => {
      mockGenerateContent.mockResolvedValue(makeSuccessResponse('Fresh answer'));
      await aiService.generateResponse('System', 'Fresh question');
      aiService.clearCache();
      await aiService.generateResponse('System', 'Fresh question');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    test('should throw a SAFETY_BLOCK error when Gemini blocks the request', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '',
          promptFeedback: { blockReason: 'PROHIBITED_CONTENT' },
        },
      });
      await expect(aiService.generateResponse('System', 'Bad question'))
        .rejects.toMatchObject({ code: 'SAFETY_BLOCK' });
    });

    test('should propagate API network errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network timeout'));
      await expect(aiService.generateResponse('System', 'Any question'))
        .rejects.toThrow('Network timeout');
    });

    test('getCacheSize() reflects the current number of cached entries', async () => {
      mockGenerateContent.mockResolvedValue(makeSuccessResponse('Answer'));
      expect(aiService.getCacheSize()).toBe(0);
      await aiService.generateResponse('System', 'Question A');
      expect(aiService.getCacheSize()).toBe(1);
      await aiService.generateResponse('System', 'Question B');
      expect(aiService.getCacheSize()).toBe(2);
    });
  });

  // ── getSystemPrompt() ──────────────────────────────────────────────────────

  describe('getSystemPrompt()', () => {
    test('should default to English when no language is provided', () => {
      const prompt = aiService.getSystemPrompt({});
      expect(prompt).toContain('English');
    });

    test.each([
      ['hi', 'Hindi'],
      ['mr', 'Marathi'],
      ['gu', 'Gujarati'],
      ['ta', 'Tamil'],
      ['te', 'Telugu'],
      ['kn', 'Kannada'],
      ['ml', 'Malayalam'],
      ['bn', 'Bengali'],
    ])('should resolve language code "%s" to "%s"', (code, name) => {
      const prompt = aiService.getSystemPrompt({ language: code });
      expect(prompt).toContain(name);
    });

    test('should include GPS coordinates when location is provided', () => {
      const prompt = aiService.getSystemPrompt({ location: { latitude: 18.96, longitude: 72.82 } });
      expect(prompt).toContain('18.96');
      expect(prompt).toContain('72.82');
    });

    test('should note location unavailable when no location given', () => {
      const prompt = aiService.getSystemPrompt({});
      expect(prompt).toContain('unavailable');
    });

    test('should always contain the neutrality and safety rules', () => {
      const prompt = aiService.getSystemPrompt({});
      expect(prompt).toContain('NEUTRALITY');
      expect(prompt).toContain('SAFETY');
      expect(prompt).toContain('ElectionEase AI');
    });

    test('should contain the required output format marker', () => {
      const prompt = aiService.getSystemPrompt({});
      expect(prompt).toContain('|||');
    });
  });
});
