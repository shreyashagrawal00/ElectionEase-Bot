import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 -translate-y-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-100/50 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl tracking-tight font-extrabold text-slate-900 sm:text-6xl md:text-7xl">
          <span className="block">{t('welcome')}</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500">
          {t('subtitle')}
        </p>
        
        <div className="mt-8 flex justify-center space-x-6 text-slate-800">
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
               <span className="text-3xl font-extrabold text-primary-600">195</span>
               <span className="text-sm font-medium uppercase tracking-wide text-slate-500">{t('days')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
               <span className="text-3xl font-extrabold text-primary-600">14</span>
               <span className="text-sm font-medium uppercase tracking-wide text-slate-500">{t('hours')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
               <span className="text-3xl font-extrabold text-primary-600 font-hindi">{t('until_election')}</span>
            </div>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <Link to="/dashboard">
            <Button className="px-8 py-3 text-lg">{t('get_started')}</Button>
          </Link>
          <Link to="/knowledge">
            <Button variant="outline" className="px-8 py-3 text-lg bg-white">{t('browse_candidates')}</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
