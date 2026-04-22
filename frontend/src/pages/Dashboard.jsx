import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axios from 'axios';
import { CheckCircle, Circle, MapPin, Search, UserCheck, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import NewsSection from '../components/NewsSection';

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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('dashboard_title', { name: user.name })}</h1>
          <p className="text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="mt-4 md:mt-0 w-full md:w-64">
           <div className="flex justify-between text-sm mb-1 font-medium text-slate-700">
              <span>{t('readiness')}</span>
              <span>{progressPercentage}%</span>
           </div>
           <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
           </div>
        </div>
      </div>

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

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">{t('upcoming_elections')}</h2>
        {elections.length === 0 ? (
          <p className="text-slate-500 italic">No elections found for this region.</p>
        ) : (
          elections.map(election => (
            <Card key={election._id} className="p-6 mb-4 flex justify-between items-center bg-white border-l-4 border-l-primary-500">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{getLocalized(election.title)}</h3>
                <p className="text-slate-500">
                  {new Date(election.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'hi-IN')} &bull; {election.state || 'National'}
                </p>
              </div>
              <Button onClick={() => navigate(`/timeline/${election._id}`)}>{t('view_timeline')}</Button>
            </Card>
          ))
        )}
      </div>

      <NewsSection stateFilter={selectedState} />
    </div>
  );
};

export default Dashboard;
