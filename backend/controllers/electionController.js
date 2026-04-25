const Election = require('../models/Election');
const scraperService = require('../services/scraperService');

// Simple in-memory cache to avoid rate limiting
const historyCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

exports.getStateHistory = async (req, res, next) => {
  try {
    const { stateName } = req.params;
    
    // Check cache
    if (historyCache.has(stateName)) {
      const cached = historyCache.get(stateName);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data);
      }
    }

    const historyData = await scraperService.getStateHistory(stateName);

    historyCache.set(stateName, {
      timestamp: Date.now(),
      data: historyData
    });

    res.json(historyData);
  } catch (err) {
    next(err);
  }
};

exports.getCandidateDetails = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`Starting deep research scrape for: ${url}`);
    const details = await scraperService.getCandidateDetails(url);

    console.log('Scrape complete:', { name: details.name, assets: details.assets });
    res.json(details);
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Target website (MyNeta) took too long to respond.' });
    }
    next(err);
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
