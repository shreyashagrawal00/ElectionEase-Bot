import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Target, Award, Shield, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * @component VoterMatchQuiz
 * @description Interactive value-alignment assessment.
 * Maps user responses to candidate platform keywords to generate "Match percentages".
 */
const VoterMatchQuiz = () => {
    const { t } = useTranslation();
    const { saveQuizResults, user } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep]       = useState(0);
    const [answers, setAnswers] = useState({});
    
    // Ensure questions is always an array
    const questions = useMemo(() => {
      const q = t('quiz.questions', { returnObjects: true });
      return Array.isArray(q) ? q : [];
    }, [t]);

    const handleAnswer = useCallback((option) => {
        const currentQId = questions[step].id;
        const newAnswers = { ...answers, [currentQId]: option };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setStep('calculating');
            // Final save with the complete set of answers
            setTimeout(() => {
                saveQuizResults(newAnswers);
                setStep('done');
            }, 2400);
        }
    }, [step, questions, answers, saveQuizResults]);

    // ── Calculating State ───────────────────────────────────────────────────────
    if (step === 'calculating') {
        return (
            <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-xl w-full p-12 glass-card rounded-[3rem] shadow-2xl text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary-500/5 -z-10 animate-pulse" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="w-24 h-24 bg-primary-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary-500/20"
                    >
                        <Target className="w-12 h-12 text-primary-600" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">
                        {t('quiz.match_calc') || 'Analyzing Voter DNA…'}
                    </h2>
                    <p className="text-slate-500 font-medium mb-8">Mapping your values against legislative records</p>
                    
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.4, ease: "easeInOut" }}
                            className="absolute inset-y-0 left-0 bg-primary-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        />
                    </div>
                </motion.div>
            </main>
        );
    }

    // ── Done State ──────────────────────────────────────────────────────────────
    if (step === 'done') {
        return (
            <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-2xl w-full p-16 glass-card rounded-[4rem] shadow-3xl bg-slate-900 text-white border-slate-800 text-center relative overflow-hidden group"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-1000" />
                    
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <Award className="w-10 h-10 text-primary-400" />
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tighter">
                        {t('quiz.match_found') || 'Profile Optimized'}
                    </h2>
                    <p className="text-slate-400 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium">
                        Your value alignment profile is now active. We've matched your stances on 
                        <span className="text-white"> {Object.keys(answers).length} critical topics </span> 
                        against the active candidate pool.
                    </p>
                    
                    <Button 
                        variant="white"
                        onClick={() => navigate('/candidates')} 
                        size="lg"
                        className="px-12 py-5 rounded-2xl font-black tracking-widest uppercase"
                    >
                        <span>See Matches</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </motion.div>
            </main>
        );
    }

    const currentQ = questions[step];
    if (!currentQ) return null;

    return (
        <main className="max-w-4xl mx-auto py-20 px-4 sm:px-6">
            <div className="mb-16 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-primary-100/10 border border-primary-500/20 text-primary-600 px-4 py-2 rounded-full mb-6"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Civic Insight Engine</span>
                </motion.div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
                    {t('quiz.title') || 'Voter Alignment Quiz'}
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                    {t('quiz.subtitle') || 'Find the representative who truly mirrors your vision for the future.'}
                </p>
            </div>

            <div className="relative">
                {/* ── Progress Interface ── */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 px-2">
                    <div className="flex gap-2">
                        {questions.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                                    i < step ? 'w-10 bg-primary-600' : i === step ? 'w-10 bg-primary-400' : 'w-4 bg-slate-200'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Progress: {Math.round(((step) / questions.length) * 100)}%
                        </span>
                        <div className="w-px h-3 bg-slate-200" />
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                            {t('quiz.question_prefix') || 'Query'} {step + 1} / {questions.length}
                        </span>
                    </div>
                </div>

                {/* ── Question Card ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="glass-card p-8 sm:p-14 rounded-[3.5rem] shadow-3xl border border-white/20 relative"
                    >
                        <div className="absolute top-8 left-8">
                             <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <Shield className="w-5 h-5 text-primary-600" />
                             </div>
                        </div>
                        
                        <div className="pt-10">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-12 leading-tight tracking-tight">
                                {currentQ.text}
                            </h3>
                            
                            <div className="grid gap-4 sm:grid-cols-2">
                                {currentQ.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        className="p-6 rounded-3xl border-2 border-slate-100 text-left hover:border-primary-500 hover:bg-primary-50/50 hover:shadow-xl transition-all group flex items-center justify-between focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                                        aria-label={`Select option: ${opt}`}
                                    >
                                        <span className="font-bold text-slate-700 group-hover:text-primary-700 transition-colors">
                                            {opt}
                                        </span>
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:scale-110 transition-all shadow-sm">
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footnote */}
                <p className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <LockIcon className="w-3 h-3" />
                    Answers are processed locally and never stored on public servers
                </p>
            </div>
        </main>
    );
};

// Simple inline Lock icon
const LockIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default VoterMatchQuiz;
