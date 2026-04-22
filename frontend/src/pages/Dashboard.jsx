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

      {/* Location Filter */}
      <Card className="p-4 mb-8 bg-white border-slate-200">
        <div className="flex items-center mb-3 text-slate-700 font-semibold">
          <Filter className="w-4 h-4 mr-2" />
          <span>{t('select_state')}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">{t('all_states')}</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {selectedState === 'Maharashtra' && (
            <select 
              value={selectedDistrict} 
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Districts</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Nagpur">Nagpur</option>
            </select>
          )}
        </div>
      </Card>
      
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

      <NewsSection stateFilter={selectedState} />
    </div>
  );
};

export default Dashboard;
