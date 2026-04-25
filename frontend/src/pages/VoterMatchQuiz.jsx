import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Target, Award } from 'lucide-react';
import Button from '../components/ui/Button';

const VoterMatchQuiz = () => {
    const { t } = useTranslation();
    const { saveQuizResults } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = t('quiz.questions', { returnObjects: true });

    const handleAnswer = (option) => {
        setAnswers(prev => ({ ...prev, [questions[step].id]: option }));
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setStep('calculating');
            setTimeout(() => {
                saveQuizResults(answers);
                setStep('done');
            }, 2000);
        }
    };

    if (step === 'calculating') {
        return (
            <div className="max-w-4xl mx-auto py-32 px-4 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-16 glass-card rounded-[3rem] shadow-2xl"
                >
                    <div className="w-24 h-24 bg-primary-100/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <Target className="w-12 h-12 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{t('quiz.match_calc')}</h2>
                    <div className="w-48 h-2 bg-slate-100/50 rounded-full mx-auto overflow-hidden mt-8">
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-full h-full bg-primary-500"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div className="max-w-4xl mx-auto py-32 px-4 text-center">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-16 glass-card rounded-[4rem] shadow-3xl bg-slate-800 text-white border-slate-700"
                >
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Award className="w-12 h-12 text-primary-400" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">{t('quiz.match_found')}</h2>
                    <p className="text-slate-400 text-xl mb-12 max-w-md mx-auto">Your value alignment profile is complete. Explore candidates to see matching percentages!</p>
                    <Button onClick={() => navigate('/candidates')} className="px-12 py-5 rounded-2xl shadow-2xl bg-primary-500 hover:bg-primary-400 text-white font-black group">
                        See Your Matches
                        <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </motion.div>
            </div>
        );
    }

    const q = questions[step];

    return (
        <div className="max-w-3xl mx-auto py-24 px-4">
            <div className="mb-12 text-center">
                <div className="inline-flex items-center space-x-2 bg-[var(--status-info-bg)] text-[var(--status-info-text)] px-4 py-2 rounded-full mb-6">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Match Engine v1.0</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{t('quiz.title')}</h1>
                <p className="text-slate-500 text-lg">{t('quiz.subtitle')}</p>
            </div>

            <div className="relative">
                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="flex space-x-2">
                        {questions.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-2 rounded-full transition-all duration-500 ${i <= step ? 'w-12 bg-primary-500' : 'w-4 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('quiz.question_prefix')} {step + 1}/{questions.length}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        className="glass-card p-12 rounded-[3.5rem] shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold text-slate-800 mb-10 leading-tight">{q.text}</h3>
                        <div className="grid gap-4">
                            {q.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(opt)}
                                    className="p-6 rounded-2xl border-2 border-slate-200 text-left hover:border-primary-500 hover:bg-primary-500/10 hover:shadow-lg transition-all group flex items-center justify-between"
                                >
                                    <span className="font-bold text-slate-800 group-hover:text-primary-700">{opt}</span>
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all">
                                        <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VoterMatchQuiz;
