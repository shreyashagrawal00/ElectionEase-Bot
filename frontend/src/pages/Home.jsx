import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 -translate-y-24 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 translate-y-24 right-0 w-[500px] h-[500px] bg-accent-100/20 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-6xl tracking-tight font-black text-slate-900 sm:text-7xl md:text-8xl mb-8">
          <span className="block">{t('welcome')}</span>
          <span className="block premium-gradient bg-clip-text text-transparent pb-2">{t('brand_name') || 'ElectionEase'}</span>
        </h1>
        <p className="mt-8 text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        
        <div className="mt-12 flex flex-wrap justify-center gap-6">
            {[
              { val: '195', label: t('days') },
              { val: '14', label: t('hours') },
              { val: t('until_election'), label: '', full: true }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                className={`glass-card p-6 rounded-3xl min-w-[120px] transition-all duration-300 ${stat.full ? 'bg-primary-50/50 border-primary-100' : ''}`}
              >
                <span className={`block font-black text-slate-900 ${stat.full ? 'text-xl font-hindi py-2' : 'text-4xl'}`}>
                  {stat.val}
                </span>
                {stat.label && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 block">
                    {stat.label}
                  </span>
                )}
              </motion.div>
            ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-6">
          <Link to="/dashboard">
            <Button className="px-10 py-4 text-xl shadow-2xl hover:shadow-primary-200 transition-all font-bold">
              {t('get_started')}
            </Button>
          </Link>
          <Link to="/knowledge">
            <Button variant="outline" className="px-10 py-4 text-xl bg-white/50 backdrop-blur-sm border-slate-200 hover:border-primary-300 font-bold">
              {t('browse_candidates')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
