import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axios from 'axios';
import { CheckCircle, Circle, MapPin, Search, UserCheck, Filter, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import NewsSection from '../components/NewsSection';
import VoterStats from '../components/VoterStats';
import IndiaMap from '../components/ui/IndiaMap';

const Dashboard = () => {
  const { user, loading, updateProgress } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [elections, setElections] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const states = ['Maharashtra', 'Uttar Pradesh', 'Delhi', 'Karnataka']; // Example list

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        let url = 'http://127.0.0.1:5000/api/elections';
        const params = new URLSearchParams();
        if (selectedState) params.append('state', selectedState);
        if (selectedDistrict) params.append('district', selectedDistrict);
        
        const res = await axios.get(`${url}?${params.toString()}`);
        setElections(res.data);
      } catch(err) { console.error(err); }
    };
    fetchElections();
  }, [selectedState, selectedDistrict]);

  if (loading || !user) return <div className="text-center p-8">Loading...</div>;

  const steps = [
    { id: 'registrationCompleted', title: t('step_1'), icon: UserCheck, desc: t('step_1_desc') },
    { id: 'candidatesResearched', title: t('step_2'), icon: Search, desc: t('step_2_desc') },
    { id: 'voted', title: t('step_3'), icon: MapPin, desc: t('step_3_desc') }
  ];

  const handleStepComplete = async (stepId, currentState) => {
    await updateProgress({ [stepId]: !currentState });
  };

  const completedCount = steps.filter(step => user.progress?.[step.id]).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  const getLocalized = (field) => {
    if (!field) return '';
    return field[i18n.language] || field['en'] || '';
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {t('dashboard_title', { name: user.name })}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">{t('subtitle')}</p>
        </div>
        
        <div className="glass-card p-6 rounded-3xl flex-1 max-w-md">
           <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block mb-1">{t('readiness')}</span>
                <span className="text-4xl font-extrabold text-primary-600 text-glow">{progressPercentage}%</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-500">{completedCount} of {steps.length} Steps</span>
              </div>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-1 shadow-inner border border-slate-200/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="premium-gradient h-full rounded-full shadow-lg"
              ></motion.div>
           </div>
        </div>
      </div>

      <VoterStats />

      {/* Interactive Map & Context Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-2 rounded-[2.5rem] bg-white/40 backdrop-blur-md border-white/50 shadow-2xl overflow-hidden"
        >
          <div className="p-8 flex items-center justify-between border-b border-slate-200/50 mb-2">
              <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('select_state')}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Geospatial Election Center</p>
              </div>
              <motion.div 
                key={selectedState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-6 py-2 rounded-2xl text-sm font-bold border transition-all duration-500 shadow-sm ${selectedState ? 'bg-primary-600 border-primary-700 text-white shadow-primary-200' : 'bg-white border-slate-200 text-slate-500'}`}
              >
                  {selectedState ? (
                    <span className="flex items-center">
                       <MapPin className="w-4 h-4 mr-2" />
                       {selectedState}
                    </span>
                  ) : (
                    "All Regions"
                  )}
              </motion.div>
          </div>
          <IndiaMap selectedState={selectedState} onSelectState={setSelectedState} />
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-200/50">
             <div className="flex flex-wrap gap-3">
                {['Maharashtra', 'Uttar Pradesh', 'Delhi', 'Karnataka'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedState(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedState === s ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedState('')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${!selectedState ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-transparent text-slate-400 border-slate-200'}`}
                >
                  Clear Filter
                </button>
             </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-8 h-full justify-between">
           <VoterStats />
           {/* Step Progress Summary Card */}
           <Card className="p-8 bg-slate-900 border-slate-800 text-white rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl group-hover:bg-primary-500/30 transition-all duration-700"></div>
              <div className="relative z-10">
                <h4 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Preparation Roadmap</h4>
                <p className="text-xl font-medium leading-relaxed mb-6">
                  {selectedState ? `Analyzing election readiness for ${selectedState}.` : "You're 67% towards becoming an informed voter."}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-xs ${i <= completedCount ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        {i}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="text-primary-400 font-bold hover:text-primary-300" onClick={() => navigate('/knowledge')}>
                    Full Guide →
                  </Button>
                </div>
              </div>
           </Card>
           
           {/* Search/Discovery Tooltip */}
           <div className="p-6 bg-primary-50/50 rounded-[2rem] border border-primary-100/50">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                   <Search className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                   <h5 className="font-bold text-slate-800">Research Candidates</h5>
                   <p className="text-sm text-slate-500 mt-1">Deep dive into candidate backgrounds, wealth declarations, and previous criminal records.</p>
                   <Button onClick={() => navigate('/candidates')} className="mt-4 px-6 py-2 rounded-xl text-xs" variant="outline">
                      Open Research Center
                   </Button>
                </div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = user.progress?.[step.id];
          return (
            <Card key={step.id} className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${isComplete ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <button onClick={() => handleStepComplete(step.id, isComplete)}>
                  {isComplete ? <CheckCircle className="w-7 h-7 text-primary-600" /> : <Circle className="w-7 h-7 text-slate-300 hover:text-slate-400" />}
                </button>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Step {idx + 1}: {step.title}</h3>
              <p className="text-slate-500 text-sm">{step.desc}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">{t('upcoming_elections')}</h2>
        {elections.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border-dashed border-2 border-slate-200">
            <p className="text-slate-400 italic text-lg">No elections found for this region.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {elections.map(election => (
              <Card key={election._id} className="p-8 flex flex-col sm:flex-row justify-between items-center bg-white border-l-8 border-l-primary-500">
                <div className="mb-6 sm:mb-0">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{getLocalized(election.title)}</h3>
                  <div className="flex items-center text-slate-500 font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                    <span>{new Date(election.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'hi-IN')}</span>
                    <span className="mx-2 opacity-30">|</span>
                    <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                    <span>{election.state || 'National'}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/timeline/${election._id}`)}
                  className="w-full sm:w-auto px-10 py-4 shadow-xl hover:shadow-primary-200 transition-all"
                >
                  {t('view_timeline')}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-24">
        <NewsSection stateFilter={selectedState} />
      </div>
    </div>
  );
};

export default Dashboard;
