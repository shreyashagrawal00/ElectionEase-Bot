const Election = require('../models/Election');
const axios = require('axios');
const cheerio = require('cheerio');

// Simple in-memory cache to avoid rate limiting
const historyCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

exports.getStateHistory = async (req, res) => {
  try {
    const { stateName } = req.params;
    
    // Check cache
    if (historyCache.has(stateName)) {
      const cached = historyCache.get(stateName);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data);
      }
    }

    const url = `https://www.myneta.info/state_assembly.php?state=${encodeURIComponent(stateName)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const historyData = [];
    let currentCycle = null;
    let currentLinks = [];

    // Traverse all elements to associate links with the nearest preceding header
    $('*').each((i, el) => {
      const tagName = el.name.toUpperCase();
      const text = $(el).text().trim();

      // Detect election cycle headers (H3 or H4)
      if (['H3', 'H4'].includes(tagName) && text.includes(stateName) && /\d{4}/.test(text)) {
        if (currentCycle && currentLinks.length > 0) {
          historyData.push({ electionCycle: currentCycle, resources: currentLinks });
        }
        currentCycle = text;
        currentLinks = [];
      }

      // Stop associating links if we hit another major section
      if (currentCycle && tagName === 'H3' && text === 'State Assemblies') {
        if (currentLinks.length > 0) {
           historyData.push({ electionCycle: currentCycle, resources: currentLinks });
        }
        currentCycle = null;
        currentLinks = [];
      }

      // Detect links if inside an active cycle
      if (currentCycle && tagName === 'A') {
        let href = $(el).attr('href');
        const linkText = text;
        
        // Filter out nav links, state links, and social links
        if (href && linkText && 
            !href.includes('myneta.info/#') && 
            !href.includes('translate.google') &&
            !href.includes('state_assembly.php') &&
            !linkText.toLowerCase().includes('about') &&
            !linkText.toLowerCase().includes('contact')) {
           
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

    historyCache.set(stateName, {
      timestamp: Date.now(),
      data: historyData
    });

    res.json(historyData);
  } catch (err) {
    console.error('Error fetching state history:', err.message);
    res.status(500).json({ error: 'Failed to fetch historical data from MyNeta.' });
  }
};

exports.getCandidateDetails = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`Starting deep research scrape for: ${url}`);

    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    console.log('Successfully fetched HTML from MyNeta');

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

    // Scrape Financials (Improved targeting)
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

    console.log('Scrape complete:', { name: details.name, assets: details.assets });
    res.json(details);
  } catch (err) {
    console.error('Error scraping candidate details:', err.message);
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Target website (MyNeta) took too long to respond.' });
    }
    res.status(500).json({ error: 'Failed to extract deep research data. ' + err.message });
  }
};

exports.getElections = async (req, res) => {
  try {
    const { state, district, locationType } = req.query;
    let query = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (locationType) query.locationType = locationType;

    const elections = await Election.find(query);
    res.json(elections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.json(election);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.seedElections = async (req, res) => {
  try {
    const seedData = [
      {
        title: { 
          en: 'Maharashtra State Assembly Elections 2026', 
          hi: 'महाराष्ट्र राज्य विधानसभा चुनाव 2026',
          mr: 'महाराष्ट्र विधानसभा निवडणूक २०२६'
        },
        date: new Date('2026-10-21'),
        locationType: 'State',
        state: 'Maharashtra',
        steps: [
          { 
            title: { en: 'Voter Registration', hi: 'मतदाता पंजीकरण', mr: 'मतदार नोंदणी' }, 
            description: { 
              en: 'Ensure your name is in the electoral roll.', 
              hi: 'सुनिश्चित करें कि आपका नाम मतदाता सूची में है।',
              mr: 'मतदार यादीत तुमचे नाव असल्याची खात्री करा.'
            }, 
            order: 1, 
            actionLink: 'https://voters.eci.gov.in/' 
          },
          { 
            title: { en: 'Candidate Nomination', hi: 'उम्मीदवार नामांकन', mr: 'उमेदवार नामांकन' }, 
            description: { 
              en: 'Candidates file their nominations and affidavits.', 
              hi: 'उम्मीदवार अपना नामांकन और हलफनामा दाखिल करते हैं।',
              mr: 'उमेदवार त्यांचे उमेदवारी अर्ज आणि शपथपत्र दाखल करतात.'
            }, 
            order: 2 
          },
          { 
            title: { en: 'Polling Day', hi: 'मतदान का दिन', mr: 'मतदानाचा दिवस' }, 
            description: { 
              en: 'Go to your assigned booth and cast your vote.', 
              hi: 'अपने निर्धारित बूथ पर जाएं और अपना वोट डालें।',
              mr: 'तुमच्या नियुक्त केलेल्या बूथवर जा आणि मतदान करा.'
            }, 
            order: 3 
          }
        ],
        candidates: [
          { 
            name: 'Prakash Patil', 
            party: 'Independent', 
            bio: { 
              en: 'Local community leader and social worker.', 
              hi: 'स्थानीय समुदाय नेता और सामाजिक कार्यकर्ता।',
              mr: 'स्थानिक समुदाय नेते आणि सामाजिक कार्यकर्ते.'
            },
            platform: ['Clean Water', 'Better Schools', 'Youth Employment'],
            researchUrl: 'https://www.myneta.info/maharashtra2019/candidate.php?candidate_id=7445'
          },
          { 
            name: 'Anjali Deshmukh', 
            party: 'Regional Party', 
            bio: { 
              en: 'Environmental activist and lawyer.', 
              hi: 'पर्यावरण कार्यकर्ता और वकील।',
              mr: 'पर्यावरण कार्यकर्ता आणि वकील.'
            },
            platform: ['Urban Forestry', 'Public Transport', 'Digital Governance']
          }
        ],
        pollingStations: [
          { name: 'Shivaji High School', address: 'Dadar, Mumbai', accessibilityFeatures: ['Wheelchair ramp', 'Tactile paving'] },
          { name: 'District Office', address: 'Pune Central', accessibilityFeatures: ['Elevator', 'Braille signage'] }
        ]
      },
      {
        title: { 
          en: 'Delhi Municipal Corporation Polls', 
          hi: 'दिल्ली नगर निगम चुनाव',
          mr: 'दिल्ली महानगरपालिका निवडणूक'
        },
        date: new Date('2026-05-15'),
        locationType: 'District',
        state: 'Delhi',
        steps: [
          { 
            title: { en: 'Check Polling Booth', hi: 'मतदान केंद्र की जांच करें', mr: 'मतदान केंद्राची तपासणी करा' }, 
            description: { 
              en: 'Find your assigned booth nearby.', 
              hi: 'पास में अपना निर्धारित बूथ खोजें।',
              mr: 'तुमचे नियुक्त केलेले बूथ जवळून शोधा.'
            }, 
            order: 1 
          }
        ],
        candidates: [
          { 
            name: 'Rahul Gupta', 
            party: 'Mainstream Party', 
            bio: { en: 'Business owner.', hi: 'व्यवसाय मालिक।', mr: 'व्यवसायिक.' },
            platform: ['Lower Taxes', 'Safety First']
          }
        ],
        pollingStations: [
          { name: 'Commumity Center', address: 'Connaught Place, Delhi', accessibilityFeatures: ['Ramp'] }
        ]
      },
      {
        title: { en: 'Uttar Pradesh Assembly Elections 2027', hi: 'उत्तर प्रदेश विधानसभा चुनाव 2027', mr: 'उत्तर प्रदेश विधानसभा निवडणूक २०२७' },
        date: new Date('2027-03-15'),
        locationType: 'State',
        state: 'Uttar Pradesh',
        steps: [{ title: { en: 'Final List', hi: 'अंतिम सूची', mr: 'अंतिम यादी' }, description: { en: 'Final candidates announced.', hi: 'अंतिम उम्मीदवारों की घोषणा।', mr: 'अंतिम उमेदवार जाहीर.' }, order: 1 }],
        candidates: [
          { 
            name: 'Vikram Singh', 
            party: 'National Party', 
            bio: { en: 'Former civil servant.', hi: 'पूर्व सिविल सेवक।', mr: 'माजी सनदी अधिकारी.' },
            platform: ['Infrastructure', 'Agriculture Reform'],
            researchUrl: 'https://www.myneta.info/uttarpradesh2022/candidate.php?candidate_id=6023'
          },
          { 
            name: 'Savitri Devi', 
            party: 'Regional Front', 
            bio: { en: 'Grassroots activist.', hi: 'जमीनी कार्यकर्ता।', mr: 'तळागाळातील कार्यकर्ता.' },
            platform: ['Women Empowerment', 'Rural Health']
          }
        ],
        pollingStations: [{ name: 'Lucknow Central School', address: 'Lucknow', accessibilityFeatures: ['Ramp'] }]
      },
      {
        title: { en: 'Karnataka State Elections 2028', hi: 'कर्नाटक राज्य चुनाव 2028', mr: 'कर्नाटक राज्य निवडणूक २०२८' },
        date: new Date('2028-05-10'),
        locationType: 'State',
        state: 'Karnataka',
        steps: [{ title: { en: 'Voter List Check', hi: 'मतदाता सूची की जांच', mr: 'मतदार यादी तपासणी' }, description: { en: 'Check your status.', hi: 'अपनी स्थिति की जांच करें।', mr: 'तुमची स्थिती तपासा.' }, order: 1 }],
        candidates: [
          { 
            name: 'Karthik Reddy', 
            party: 'Alliance', 
            bio: { en: 'Tech entrepreneur.', hi: 'टेक उद्यमी।', mr: 'तंत्रज्ञान उद्योजक.' },
            platform: ['Digital City', 'Water Management']
          }
        ],
        pollingStations: [{ name: 'Bangalore Public Hall', address: 'Bangalore', accessibilityFeatures: ['Elevator'] }]
      }
    ];

    await Election.deleteMany({});
    await Election.insertMany(seedData);
    res.json({ msg: 'Localized election data seeded successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
