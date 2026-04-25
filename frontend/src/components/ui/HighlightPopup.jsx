import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, Search, MessageSquare, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import Button from './Button';

/**
 * HighlightPopup component displays a premium feature introduction to first-time users.
 * Features smooth animations and glassmorphic design.
 */
const HighlightPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem('hasSeenHighlight');
      if (!hasSeen) {
        setIsOpen(true);
        localStorage.setItem('hasSeenHighlight', 'true');
      }
    }, 2000); // Show after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { 
      title: 'AI Civic Assistant', 
      desc: 'Ask complex election questions in 10+ languages.', 
      icon: MessageSquare, 
      color: 'bg-blue-100 text-blue-600',
      tag: 'New'
    },
    { 
      title: 'Deep Research Engine', 
      desc: 'Verify candidate assets, history, and records.', 
      icon: Search, 
      color: 'bg-emerald-100 text-emerald-600',
      tag: 'Verified'
    },
    { 
      title: 'Voter Match AI', 
      desc: 'Find candidates that align with your personal values.', 
      icon: Target, 
      color: 'bg-amber-100 text-amber-600',
      tag: 'Exclusive'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
          >
            {/* Animated Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 p-6 sm:p-10">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                aria-label="Close premium feature highlight"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              <div className="mb-8 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 bg-primary-50 px-3 py-1.5 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-700">Premium Features Unlocked</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  The Future of <span className="premium-gradient bg-clip-text text-transparent">Informed Voting</span> is Here.
                </h2>
                <p className="mt-3 text-base text-slate-500 font-medium italic">
                  ElectionEase Pro: Your intelligent guide through the 2026 Democratic Process.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start p-4 rounded-2xl bg-slate-50 border border-slate-200/50 hover:border-primary-200 hover:bg-white hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className={`p-3 rounded-xl ${feature.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-bold text-slate-900 text-sm">{feature.title}</h3>
                        <span className="text-[9px] font-black uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-400">
                          {feature.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 text-base font-black shadow-xl hover:shadow-primary-300 transition-all rounded-2xl"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Experience Pro Now
                </Button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-6 opacity-30">
                <div className="flex items-center space-x-2 grayscale">
                   <CheckCircle2 className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold">ECI Verified Data</span>
                </div>
                <div className="flex items-center space-x-2 grayscale">
                   <Sparkles className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold">Gemini AI Model</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HighlightPopup;
