import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from './Card';

const CandidateCard = ({ candidate }) => {
  const { t, i18n } = useTranslation();
  const [showPlatform, setShowPlatform] = useState(false);

  const getLocalized = (field) => {
    if (!field) return '';
    return field[i18n.language] || field['en'] || '';
  };

  const partyColors = {
    'Independent': 'bg-slate-100 text-slate-700 border-slate-200',
    'Regional Party': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Mainstream Party': 'bg-blue-100 text-blue-700 border-blue-200',
    'National Congress': 'bg-sky-100 text-sky-700 border-sky-200',
    'People\'s Front': 'bg-orange-100 text-orange-700 border-orange-200',
    'Alliance': 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  const currentPartyColor = partyColors[candidate.party] || 'bg-primary-50 text-primary-700 border-primary-100';

  return (
    <Card className="p-0 overflow-hidden border border-slate-200/50 flex flex-col h-full bg-white/80 backdrop-blur-md">
      {/* Header with Background Pattern */}
      <div className="h-24 bg-slate-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center z-10 border-4 border-white">
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
                  {candidate.platform.map((item, i) => (
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
  );
};

export default CandidateCard;
