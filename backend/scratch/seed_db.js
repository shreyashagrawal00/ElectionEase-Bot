const mongoose = require('mongoose');
const Election = require('../models/Election');
require('dotenv').config();

const seedData = [
  {
    title: { 
      en: 'Maharashtra State Assembly Elections 2026', 
      hi: 'महाराष्ट्र राज्य विधानसभा चुनाव 2026',
      mr: 'महाराष्ट्र विधानसभा निवडणूक २०२६',
      gu: 'મહારાષ્ટ્ર રાજ્ય વિધાનસભા ચૂંટણી ૨૦૨૬',
      bn: 'মহারাষ্ট্র রাজ্য বিধানসভা নির্বাচন ২০২৬',
      ta: 'மகாராஷ்டிரா மாநில சட்டப்பேரவைத் தேர்தல் 2026',
      te: 'మహారాష్ట్ర రాష్ట్ర అసెంబ్লী ఎన్నికలు 2026',
      ml: 'മഹാരാഷ്ട്ര നിയമസഭാ തിരഞ്ഞെടുപ്പ് 2026',
      kn: 'ಮಹಾರಾಷ್ಟ್ರ ವಿಧಾನಸಭಾ ಚುನಾವणे 2026'
    },
    date: new Date('2026-10-21'),
    locationType: 'State',
    state: 'Maharashtra',
    steps: [
      { 
        title: { 
          en: 'Voter Registration', hi: 'मतदाता पंजीकरण', mr: 'मतदार नोंदणी',
          gu: 'મતદાર નોંધણી', bn: 'ভোটার নিবন্ধন', ta: 'வாக்காளர் பதிவு', te: 'ఓటరు నమోదు',
          ml: 'വോട്ടർ രജിസ്ട്രേഷൻ', kn: 'ಮತದಾರರ ನೋಂದಣಿ'
        }, 
        description: { 
          en: 'Ensure your name is in the electoral roll.', 
          hi: 'सुनिश्चित करें कि आपका नाम मतदाता सूची में है।',
          mr: 'मतदार यादीत तुमचे नाव असल्याची खात्री करा.',
          gu: 'ખાતરી કરો કે તમારું નામ મતદાર યાદીમાં છે.',
          bn: 'ভোটার তালিকায় আপনার নাম আছে তা নিশ্চিত করুন।',
          ta: 'வாக்காளர் பட்டியலில் உங்கள் பெயர் இருப்பதை உறுதி செய்யவும்.',
          te: 'ఓటరు జాబితాలో మీ పేరు ఉందని నిర్ధారించుకోండి.',
          ml: 'വോട്ടർ പട്ടികയിൽ നിങ്ങളുടെ പേരുണ്ടെന്ന് ഉറപ്പാക്കുക.',
          kn: 'ಮತದಾರರ ಪಟ್ಟಿಯಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರಿರುವುದನ್ನು খಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.'
        }, 
        order: 1, 
        actionLink: 'https://voters.eci.gov.in/' 
      },
      { 
        title: { 
          en: 'Candidate Nomination', hi: 'उम्मीदवार नामांकन', mr: 'ઉમેદવાર નામાંકન',
          gu: 'ઉમેદવાર નામાંકन', bn: 'প্রার্থী মনোনয়ন', ta: 'வேட்பாளர் நியமனம்', te: 'అభ్యర్థి నామినేషన్',
          ml: 'സ്ഥാനാർത്ഥി നാമനിർദ്ദേശം', kn: 'ಅಭ್ಯರ್ಥಿ ನಾಮನಿರ್ದೇಶನ'
        }, 
        description: { 
          en: 'Candidates file their nominations and affidavits.', 
          hi: 'उम्मीदवार अपना नामांकन और हलफनामा दाखिल करते हैं।',
          mr: 'उमेदवार त्यांचे उमेदवारी अर्ज आणि शपथपत्र दाखल करतात.',
          gu: 'ઉમેદવારો તેમના નામાંકન અને સોગંદનામા રજૂ કરે છે.',
          bn: 'প্রার্থীরা তাদের মনোনয়ন এবং হলফনামা জমা দেন।',
          ta: 'வேட்பாளர்கள் தங்கள் வேட்புமனுக்கள் மற்றும் பிரமாணப் பத்திரங்களை தாக்கல் செய்கின்றனர்.',
          te: 'అభ్యర్థులు తమ నామినేషన్లు మరియు అఫిడవిట్లను దాఖలు చేస్తారు.',
          ml: 'സ്ഥാനാർത്ഥികൾ അവരുടെ നാമനിർദ്ദേശ പത്രികയും സത്യവാങ്മൂലവും സമർപ്പിക്കുന്നു.',
          kn: 'ಅಭ್ಯರ್ಥಿಗಳು ತಮ್ಮ ನಾಮನಿರ್ದೇಶನ ಮತ್ತು ಅಫಿಡವಿಟ್ಗಳನ್ನು ಸಲ್ಲಿಸುತ್ತಾರೆ.'
        }, 
        order: 2 
      },
      { 
        title: { 
          en: 'Polling Day', hi: 'मतदान का दिन', mr: 'મતદાનનો દિવસ',
          gu: 'મતદાનનો દિવસ', bn: 'ভোটের দিন', ta: 'வாக்குப்பதிவு நாள்', te: 'పోలింగ్ రోజు',
          ml: 'വോട്ടെടുപ്പ് ദിവസം', kn: 'ಮತದಾನದ ದಿನ'
        }, 
        description: { 
          en: 'Go to your assigned booth and cast your vote.', 
          hi: 'अपने निर्धारित बूथ पर जाएं और अपना वोट डालें।',
          mr: 'तुमच्या नियुक्त केलेल्या बूथवर जा आणि मतदान करा.',
          gu: 'તમારા નિયત બૂથ પર જાઓ અને તમારો મત આપો.',
          bn: 'আপনার নির্ধারিত বুথে যান এবং আপনার ভোট দিন।',
          ta: 'உங்களுக்கு ஒதுக்கப்பட்ட சாவடிக்குச் சென்று உங்கள் வாக்கைப் பதிவு செய்யுங்கள்.',
          te: 'మీకు కేటాయించిన బూత్‌కు వెళ్లి మీ ఓటు వేయండి.',
          ml: 'നിങ്ങൾക്ക് അനുവദിച്ച ബൂത്തിൽ പോയി വോട്ട് രേഖപ്പെടുത്തുക.',
          kn: 'ನಿಮಗೆ ನಿಯೋಜಿಸಲಾದ ಬೂತ್‌ಗೆ ಹೋಗಿ ನಿಮ್ಮ ಮತ ಚಲಾಯಿಸಿ.'
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
          mr: 'સ્થાનિક સમુદાય નેતા आणि सामाजिक कार्यकर्ता.',
          gu: 'સ્થાનિક સમુદાયના નેતા અને સામાજિક કાર્યકર.',
          bn: 'স্থানীয় সম্প্রদায় নেতা এবং সমাজকর্মী।',
          ta: 'உள்ளூர் சமூகத் தலைவர் மற்றும் சமூக சேவகர்.',
          te: 'స్థానిక సంఘం నాయకుడు మరియు సామాజిక కార్యకర్త.'
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
          mr: 'પર્યાવરણ કાર્યકર અને વકીલ.',
          gu: 'પર્યાવરણ કાર્યકર અને વકીલ.',
          bn: 'পরিবেশ কর্মী এবং আইনজীবী।',
          ta: 'சுற்றுச்சூழல் ஆர்வலர் மற்றும் வழக்கறிஞர்.',
          te: 'పర్యావరణ కార్యకర్త మరియు న్యాయవాది.'
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
      { name: 'Community Center', address: 'Connaught Place, Delhi', accessibilityFeatures: ['Ramp'] }
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
    steps: [{ title: { en: 'Voter List Check', hi: 'मतदाता सूची की जांच', mr: 'मतदाता सूची की जांच' }, description: { en: 'Check your status.', hi: 'अपनी स्थिति की जांच करें।', mr: 'तुमची स्थिती तपासा.' }, order: 1 }],
    candidates: [
      { 
        name: 'Karthik Reddy', 
        party: 'Alliance', 
        bio: { en: 'Tech entrepreneur.', hi: 'टेक उद्यमी।', mr: 'तंत्रज्ञान उद्योजक.' },
        platform: ['Digital City', 'Water Management']
      }
    ],
    pollingStations: [{ name: 'Bangalore Public Hall', address: 'Bangalore', accessibilityFeatures: ['Elevator'] }]
  },
  {
    title: { en: 'West Bengal Assembly Elections 2026', hi: 'पश्चिम बंगाल विधानसभा चुनाव 2026', mr: 'पश्चिम बंगाल विधानसभा निवडणूक २०२६' },
    date: new Date('2026-05-10'),
    locationType: 'State',
    state: 'West Bengal',
    steps: [{ title: { en: 'Voter Registration', hi: 'मतदाता पंजीकरण' }, description: { en: 'Register online.' }, order: 1 }],
    candidates: [],
    pollingStations: []
  },
  {
    title: { en: 'Tamil Nadu State Assembly 2026', hi: 'तमिलनाडु राज्य विधानसभा 2026' },
    date: new Date('2026-04-15'),
    locationType: 'State',
    state: 'Tamil Nadu',
    steps: [],
    candidates: [],
    pollingStations: []
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    await Election.deleteMany({});
    console.log('Cleared existing elections');
    await Election.insertMany(seedData);
    console.log('Seeded elections successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
