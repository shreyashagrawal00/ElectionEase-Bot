const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper Service for MyNeta Candidate Data
 */
class ScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Fetches and parses candidate details from a MyNeta URL
   * @param {string} url - The URL to scrape
   * @returns {Promise<Object>} - Parsed candidate details
   */
  async getCandidateDetails(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const $ = cheerio.load(response.data);

      const details = {
        name: $('.candidate-name').text().trim() || 'Unknown Candidate',
        criminalCases: 0,
        criminalDetails: '',
        assets: 'N/A',
        liabilities: 'N/A',
        netWorth: 'N/A',
        education: 'N/A',
        source: url
      };

      // Scrape Criminal Cases
      const criminalText = $('.criminal-cases').text().trim();
      if (criminalText) {
        const match = criminalText.match(/(\d+)/);
        details.criminalCases = match ? parseInt(match[1]) : 0;
        details.criminalDetails = criminalText;
      }

      // Scrape Education
      $('div, td, th').each((i, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase().includes('education') || text.toLowerCase().includes('educational qualification')) {
          const value = $(el).next().text().trim();
          if (value) details.education = value;
        }
      });

      // Scrape Financials
      $('table tr, div.grid-row').each((i, el) => {
        const rowText = $(el).text().toLowerCase();
        const cells = $(el).find('td, div');
        
        if (rowText.includes('total assets')) {
          details.assets = cells.last().text().trim();
        }
        if (rowText.includes('total liabilities')) {
          details.liabilities = cells.last().text().trim();
        }
      });

      // Regex Fallbacks
      if (details.assets === 'N/A') {
        const assetMatch = response.data.match(/Total Assets:?\s*(?:Rs\s*)?([\d,]+)/i);
        if (assetMatch) details.assets = `Rs ${assetMatch[1]}`;
      }

      return details;
    } catch (err) {
      console.error(`ScraperService Error [${url}]:`, err.message);
      throw err;
    }
  }

  /**
   * Fetches state election history
   * @param {string} stateName 
   */
  async getStateHistory(stateName) {
    const url = `https://www.myneta.info/state_assembly.php?state=${encodeURIComponent(stateName)}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': this.userAgent }
    });
    
    const $ = cheerio.load(response.data);
    const historyData = [];
    let currentCycle = null;
    let currentLinks = [];

    $('*').each((i, el) => {
      const tagName = el.name.toUpperCase();
      const text = $(el).text().trim();

      if (['H3', 'H4'].includes(tagName) && text.includes(stateName) && /\d{4}/.test(text)) {
        if (currentCycle && currentLinks.length > 0) {
          historyData.push({ electionCycle: currentCycle, resources: currentLinks });
        }
        currentCycle = text;
        currentLinks = [];
      }

      if (currentCycle && tagName === 'H3' && text === 'State Assemblies') {
        if (currentLinks.length > 0) {
           historyData.push({ electionCycle: currentCycle, resources: currentLinks });
        }
        currentCycle = null;
        currentLinks = [];
      }

      if (currentCycle && tagName === 'A') {
        let href = $(el).attr('href');
        const linkText = text;
        
        if (href && linkText && 
            !href.includes('myneta.info/#') && 
            !href.includes('state_assembly.php')) {
           
           if (!href.startsWith('http')) {
             href = 'https://www.myneta.info/' + href.replace(/^\//, '');
           }
           
           if (!currentLinks.find(l => l.url === href)) {
             currentLinks.push({ label: linkText, url: href });
           }
        }
      }
    });

    if (currentCycle && currentLinks.length > 0) {
      historyData.push({ electionCycle: currentCycle, resources: currentLinks });
    }

    return historyData;
  }
}

module.exports = new ScraperService();
