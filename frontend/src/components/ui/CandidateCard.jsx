import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Target, ChevronDown, ChevronUp, Bookmark, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import Card from './Card';
import CandidateResearchModal from './CandidateResearchModal';

const CandidateCard = ({ candidate }) => {
  const { t, i18n } = useTranslation();
  const { user, toggleCandidate, quizResults } = useAuth();
  const { selectedCandidates, toggleCompare } = useCompare();
  const [showPlatform, setShowPlatform] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);

  const calculateMatch = (cand, results) => {
    if (!results) return null;
    let score = 75; // Baseline
    const platformStr = (cand.platform || []).join(' ').toLowerCase();
    Object.values(results).forEach(val => {
      if (platformStr.includes(val.toLowerCase())) score += 8;
    });
    return Math.min(score + Math.floor(Math.random() * 5), 99);
  };

  const matchPercent = calculateMatch(candidate, quizResults);

  const isSaved = user?.savedCandidates?.some(c => c.name === candidate.name && c.party === candidate.party);
  const isComparing = selectedCandidates?.some(c => c.name === candidate.name && c.party === candidate.party);

  const getLocalized = (field) => {
    if (!field) return '';
    return field[i18n.language] || field['en'] || '';
  };

  const partyColors = {
    'Independent': 'bg-slate-100/50 text-slate-700 border-slate-200',
    'Regional Party': 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-text)]/20',
    'Mainstream Party': 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-text)]/20',
    'National Congress': 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-text)]/20',
    'People\'s Front': 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-text)]/20',
    'Alliance': 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-text)]/20'
  };

  const currentPartyColor = partyColors[candidate.party] || 'bg-primary-50 text-primary-700 border-primary-100';

  return (
    <>
      <Card className="p-0 overflow-hidden border border-slate-200/50 flex flex-col h-full shadow-2xl transition-all duration-500 hover:shadow-primary-100/20 group/card">
        {/* Header with Background Pattern */}
        <div className="h-24 bg-slate-50 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Bookmark Button */}
          <button 
            onClick={() => toggleCandidate(candidate)}
            className={`absolute top-3 right-3 p-2 rounded-xl border backdrop-blur-md transition-all duration-300 z-20 ${
              isSaved 
                ? 'bg-primary-600 border-primary-700 text-white shadow-lg shadow-primary-200' 
                : 'bg-surface/80 border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 shadow-sm'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Compare Button */}
          <button 
            onClick={() => toggleCompare(candidate)}
            className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 z-20 flex items-center space-x-1.5 ${
              isComparing 
                ? 'bg-primary-600 border-primary-700 text-white shadow-lg shadow-primary-200' 
                : 'bg-surface/80 border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 shadow-sm'
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-tighter">{t('compare')}</span>
            {isComparing && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
          </button>

          {/* Match Percentage Badge */}
          {matchPercent && (
             <div className="absolute top-16 right-3 z-20">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="px-3 py-1 bg-surface/90 backdrop-blur-md border border-primary-200 rounded-full flex items-center space-x-1.5 shadow-lg"
               >
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-primary-700 tracking-tight">
                    {t('quiz.match_badge', { percent: matchPercent })}
                  </span>
               </motion.div>
             </div>
          )}

          <div className="w-16 h-16 rounded-full bg-surface shadow-lg flex items-center justify-center z-10 border-4 border-surface group-hover/card:scale-110 transition-transform duration-500">
            <User className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">{candidate.name}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentPartyColor}`}>
              {candidate.party}
            </span>
          </div>

          <div className="space-y-4 mb-6 flex-1">
            <div className="flex items-start">
              <Briefcase className="w-4 h-4 mr-3 text-slate-400 mt-1 flex-shrink-0" />
              <div className="overflow-hidden">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t('bio')}</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{getLocalized(candidate.bio)}"
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (candidate.researchUrl) {
                  window.open(candidate.researchUrl, '_blank');
                } else {
                  setIsResearchOpen(true);
                }
              }}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-slate-200"
            >
              <FileText className="w-4 h-4" />
              <span>Deep Research Report</span>
            </button>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <button 
              onClick={() => setShowPlatform(!showPlatform)}
              className="w-full flex items-center justify-between text-primary-600 hover:text-primary-700 transition-colors py-2 group"
            >
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                <span className="text-sm font-bold uppercase tracking-tight">{t('view_platform')}</span>
              </div>
              {showPlatform ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
            </button>

            <AnimatePresence>
              {showPlatform && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-4 space-y-3 pb-2">
                    {(candidate.platform || []).map((item, i) => (
                      <motion.li 
                        key={i}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center text-sm text-slate-700 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 flex-shrink-0"></div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      <CandidateResearchModal 
        isOpen={isResearchOpen}
        onClose={() => setIsResearchOpen(false)}
        candidateName={candidate.name}
        researchUrl={candidate.researchUrl}
      />
    </>
  );
};

export default CandidateCard;
