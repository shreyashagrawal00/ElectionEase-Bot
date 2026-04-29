import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { Shield, Zap, Users, Globe, ArrowRight, MousePointer2, BarChart3 } from 'lucide-react';

/**
 * @component Home
 * @description The landing page for ElectionEase.
 * Designed to wow users with premium animations and clear value propositions.
 */
const Home = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Zap,      title: 'Smart Matching', desc: 'AI-driven alignment between your values and candidate platforms.' },
    { icon: Shield,   title: 'Verified Data',  desc: 'Crowdsourced but fact-checked legislative records and bios.' },
    { icon: BarChart3, title: 'Live Insights',  desc: 'Real-time turnout stats and historical election trends.' },
    { icon: Globe,    title: 'Multilingual',   desc: 'Fully accessible in English and Hindi for nationwide reach.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Mesh/Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-subtle" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-full mb-8 border border-white/10 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">2024 Election Edition</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-10"
          >
            Empower Your <br />
            <span className="premium-gradient bg-clip-text text-transparent pb-4">Democratic Voice.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-500 text-lg md:text-2xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
          >
            {t('subtitle') || 'The ultimate companion for informed voting. Compare candidates, track elections, and discover your political alignment.'}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link to="/dashboard">
              <Button size="lg" className="px-12 py-6 text-xl rounded-[2rem] shadow-2xl hover:shadow-primary-300 font-black uppercase tracking-widest group">
                {t('get_started') || 'Enter Dashboard'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link to="/match">
              <Button size="lg" variant="outline" className="px-12 py-6 text-xl rounded-[2rem] bg-white/50 backdrop-blur-md font-black uppercase tracking-widest border-2 border-slate-200 hover:border-primary-500">
                {t('take_quiz') || 'Value Match'}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Interactive Elements (Visual Only) */}
        <div className="mt-24 max-w-5xl mx-auto relative group">
           <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-surface rounded-[3rem] p-4 shadow-3xl border border-slate-200/50"
           >
              <div className="bg-slate-100/30 rounded-[2rem] p-8 aspect-[21/9] flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                 <div className="z-10 text-center">
                    <div className="flex -space-x-4 mb-6">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="w-16 h-16 rounded-full border-4 border-slate-50 bg-slate-200 animate-pulse shadow-xl" />
                       ))}
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Trusted by 2M+ Voters Nationwide</p>
                 </div>
                 
                 {/* Floating Badges */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute top-10 right-10 bg-surface p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3"
                 >
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                       <Zap className="text-primary-600 w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase">Current Readiness</p>
                       <p className="text-lg font-black text-slate-900">88% Informed</p>
                    </div>
                 </motion.div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────────── */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">Why ElectionEase?</h2>
            <div className="w-24 h-2 bg-primary-500 mx-auto rounded-full" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {features.map((f, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-surface p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 group"
              >
                <div className="w-16 h-16 bg-slate-100/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:scale-110 transition-all duration-500">
                  <f.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Call to Action ────────────────────────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-primary-600 rounded-[4rem] p-12 sm:p-24 text-center relative overflow-hidden group shadow-3xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-30" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black text-slate-50 mb-10 tracking-tighter">
              Ready to make <br /> an impact?
            </h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto mb-16 font-medium">
              Join thousands of voters who are using data to drive their democratic decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button variant="white" size="lg" className="px-16 py-6 rounded-2xl font-black uppercase tracking-widest">
                Get Started Now
              </Button>
              <div className="flex items-center gap-4 px-6 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                    ))}
                 </div>
                 <span className="text-slate-500 font-black">+12k Voters Joined Today</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
           Built for the People by Antigravity AI • 2024
         </p>
      </footer>
    </div>
  );
};

export default Home;
