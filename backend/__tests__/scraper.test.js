const scraperService = require('../services/scraperService');
const axios = require('axios');

jest.mock('axios');

describe('ScraperService', () => {
  it('should correctly parse candidate details from HTML', async () => {
    const mockHtml = `
      <div class="candidate-name">Prakash Patil</div>
      <div class="criminal-cases">2 Criminal Cases</div>
      <table>
        <tr><td>Total Assets</td><td>Rs 10,00,00,000</td></tr>
      </table>
    `;
    
    axios.get.mockResolvedValue({ data: mockHtml });

    const details = await scraperService.getCandidateDetails('http://example.com');

    expect(details.name).toBe('Prakash Patil');
    expect(details.criminalCases).toBe(2);
    expect(details.assets).toContain('10,00,00,000');
  });

  it('should handle missing data gracefully', async () => {
    axios.get.mockResolvedValue({ data: '<div>Empty Page</div>' });

    const details = await scraperService.getCandidateDetails('http://example.com');

    expect(details.name).toBe('Unknown Candidate');
    expect(details.criminalCases).toBe(0);
    expect(details.assets).toBe('N/A');
  });

  it('should throw error on network failure', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));

    await expect(scraperService.getCandidateDetails('http://example.com'))
      .rejects.toThrow('Network Error');
  });
});
