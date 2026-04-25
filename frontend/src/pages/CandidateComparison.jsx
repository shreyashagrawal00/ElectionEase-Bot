import React from 'react';
import { useCompare } from '../context/CompareContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Award, Target, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import CandidateCard from '../components/ui/CandidateCard';

const CandidateComparison = () => {
    const { selectedCandidates, clearCompare } = useCompare();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const getLocalized = (field) => {
        if (!field) return '';
        return field[i18n.language] || field['en'] || '';
    };

    if (selectedCandidates.length < 2) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-4 text-center">
                <div className="p-6 md:p-12 glass-card rounded-[2rem] md:rounded-[3.5rem] border-dashed border-2 border-slate-200">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">{t('selection_empty')}</h1>
                    <p className="text-slate-500 text-base md:text-lg mb-8 max-w-md mx-auto">Choose two candidates from the Research Center to unlock the side-by-side comparison engine.</p>
                    <Button onClick={() => navigate('/candidates')} className="w-full md:w-auto px-12 py-4 rounded-2xl shadow-xl hover:shadow-primary-100 transition-all">
                        Open Research Center
                    </Button>
                </div>
            </div>
        );
    }

    const [c1, c2] = selectedCandidates;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                <Button variant="ghost" onClick={() => navigate('/candidates')} className="flex items-center text-slate-500 hover:text-primary-600 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Research
                </Button>
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-[var(--status-info-bg)] text-[var(--status-info-text)] px-4 py-2 rounded-full mb-4">
                        <Award className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Decision Engine 2.0</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Civic Comparison</h1>
                </div>
                <Button variant="outline" onClick={clearCompare} className="text-red-500 border-red-100 hover:bg-red-50 rounded-2xl px-6 py-3 w-fit">
                    Clear Selection
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative mb-24">
                {/* VS Badge */}
                <div className="hidden lg:flex absolute left-1/2 top-[120px] -translate-x-1/2 z-30 w-16 h-16 rounded-full bg-slate-900 text-white items-center justify-center font-black text-xl border-4 border-surface shadow-2xl">
                    VS
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <CandidateCard candidate={c1} />
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <CandidateCard candidate={c2} />
                </motion.div>
            </div>

            {/* Platform Comparison Table */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
                <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Platform Alignment Matrix</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Side-by-side policy validation</p>
                    </div>
                    <Target className="w-10 h-10 text-primary-500 opacity-50" />
                </div>
                
                <div className="divide-y divide-slate-100">
                    <ComparisonRow label="Political Party" val1={c1.party} val2={c2.party} />
                    <ComparisonRow label="Core Biography" val1={getLocalized(c1.bio)} val2={getLocalized(c2.bio)} isItalic />
                    <ComparisonRow 
                        label="Policy Platform" 
                        val1={c1.platform.map((p, i) => <div key={i} className="mb-2 flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></div>{p}</div>)} 
                        val2={c2.platform.map((p, i) => <div key={i} className="mb-2 flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></div>{p}</div>)} 
                    />
                </div>
            </motion.div>
        </div>
    );
};

const ComparisonRow = ({ label, val1, val2, isItalic }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch">
        <div className="p-4 lg:p-8 bg-slate-100/50 lg:border-r border-slate-100 flex items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
        </div>
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className={`text-slate-700 font-medium leading-relaxed ${isItalic ? 'italic text-sm' : ''}`}>{val1}</div>
        </div>
        <div className="p-6 lg:p-8">
            <div className={`text-slate-700 font-medium leading-relaxed ${isItalic ? 'italic text-sm' : ''}`}>{val2}</div>
        </div>
    </div>
);

export default CandidateComparison;
