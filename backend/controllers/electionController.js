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
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const historyData = [];

    $('h4').each((i, el) => {
      const yearTitle = $(el).text().trim();
      const links = [];
      
      let nextEl = $(el).next();
      while(nextEl.length && nextEl[0].name !== 'h4' && nextEl[0].name !== 'h3') {
        nextEl.find('a').each((j, linkEl) => {
          const href = $(linkEl).attr('href');
          const text = $(linkEl).text().trim();
          if (href && text && !href.includes('myneta.info/#') && !href.includes('translate.google')) {
             links.push({ label: text, url: href });
          }
        });
        nextEl = nextEl.next();
      }

      // Filter duplicates
      const uniqueLinks = [];
      const seenUrls = new Set();
      links.forEach(l => {
        if (!seenUrls.has(l.url)) {
          seenUrls.add(l.url);
          uniqueLinks.push(l);
        }
      });

      if (yearTitle && uniqueLinks.length > 0) {
        historyData.push({
          electionCycle: yearTitle,
          resources: uniqueLinks
        });
      }
    });

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
            platform: ['Clean Water', 'Better Schools', 'Youth Employment']
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
