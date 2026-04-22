import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, Users, MapPin, Loader2, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from '../context/CompareContext';
import CandidateCard from '../components/ui/CandidateCard';
import Card from '../components/ui/Card';

const Candidates = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { selectedCandidates, clearCompare } = useCompare();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');

  const states = ['Maharashtra', 'Uttar Pradesh', 'Delhi', 'Karnataka']; // Consistent with Dashboard

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://127.0.0.1:5000/api/elections');
        
        // Flatten candidates from all elections and inject state context
        const allCandidates = res.data.flatMap(election => 
          election.candidates.map(candidate => ({
            ...candidate,
            state: election.state || 'National',
            electionTitle: election.title
          }))
        );
        
        setCandidates(allCandidates);
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const parties = [...new Set(candidates.map(c => c.party))];

  const filteredCandidates = candidates.filter(c => {
    const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const partyMatch = c.party.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || partyMatch;
    const matchesState = selectedState === '' || c.state === selectedState;
    const matchesParty = selectedParty === '' || c.party === selectedParty;
    return matchesSearch && matchesState && matchesParty;
  });

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-100 text-primary-600 mb-6"
        >
          <Users className="w-8 h-8" />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {t('candidate_center_title')}
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {t('candidate_center_subtitle')}
        </p>
      </div>

      {/* Filters Bar */}
      <Card className="p-8 mb-16 bg-white/50 backdrop-blur-sm border-slate-200 shadow-xl rounded-[2.5rem]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t('search_candidates')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
            >
              <option value="">{t('all_states')}</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
            >
              <option value="">{t('filter_party')}</option>
              {parties.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Candidates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium italic">Gathering candidate profiles...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <span>{filteredCandidates.length}</span>
              <span className="ml-2 text-slate-400 font-normal uppercase tracking-widest text-xs">Candidates Match</span>
            </h2>
          </div>

          {filteredCandidates.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-16 text-center rounded-[2rem] border-dashed border-2 border-slate-200"
            >
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">{t('no_candidates')}</p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              <AnimatePresence mode='popLayout'>
                {filteredCandidates.map(candidate => (
                  <motion.div
                    key={`${candidate.name}-${candidate.state}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CandidateCard candidate={candidate} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {/* Floating Comparison Bar */}
      <AnimatePresence>
        {selectedCandidates.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
          >
            <div className="bg-slate-900 border border-slate-800 text-white rounded-[2rem] shadow-2xl p-4 flex items-center justify-between backdrop-blur-xl bg-opacity-95">
              <div className="flex items-center space-x-5 pl-4">
                <div className="flex -space-x-3">
                   {selectedCandidates.map((c, i) => (
                      <div key={i} className="w-12 h-12 rounded-full bg-primary-600 border-2 border-slate-900 flex items-center justify-center font-black text-xs shadow-lg">
                        {c.name.charAt(0)}
                      </div>
                   ))}
                   {selectedCandidates.length < 2 && (
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-900 border-dashed flex items-center justify-center text-slate-500"
                      >
                        <Users className="w-5 h-5" />
                      </motion.div>
                   )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold">{selectedCandidates.length === 1 ? 'Select another candidate' : 'Ready to compare candidates'}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">Selection Tracker</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                 <button 
                  onClick={clearCompare} 
                  className="p-3 text-slate-500 hover:text-white transition-colors"
                  title="Clear Selection"
                 >
                   <Zap className="w-5 h-5" />
                 </button>
                 <button 
                   disabled={selectedCandidates.length < 2}
                   onClick={() => navigate('/compare')}
                   className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center transition-all ${selectedCandidates.length === 2 ? 'bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/25' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                 >
                   <span>Compare</span>
                   <ArrowRight className="ml-2 w-4 h-4" />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Candidates;
