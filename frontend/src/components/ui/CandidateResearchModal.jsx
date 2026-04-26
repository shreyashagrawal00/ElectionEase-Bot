import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertTriangle, TrendingUp, TrendingDown, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config/api';
import Card from './Card';
import Button from './Button';

const CandidateResearchModal = ({ isOpen, onClose, candidateName, researchUrl }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      if (!researchUrl) {
        setError('No research data available for this candidate yet.');
        return;
      }
      
      console.log('Fetching deep research for URL:', researchUrl);
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/elections/research?url=${encodeURIComponent(researchUrl)}`, {
          timeout: 15000 // 15 second timeout
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch research data', err);
        if (err.code === 'ECONNABORTED' || err.response?.status === 504) {
          setError('The research server took too long to respond. MyNeta might be experiencing high traffic.');
        } else {
          setError('Unable to load deep research data. Please check your connection or try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, researchUrl]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        aria-hidden="true"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-surface rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200/50 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center" aria-hidden="true">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 id="modal-title" className="text-2xl font-black text-slate-800 tracking-tight">Research Report: {candidateName}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verified MyNeta Analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
            aria-label="Close research report"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium italic">Scraping deep dive records...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center px-6">
               <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
               <p className="text-slate-600 font-medium mb-6">{error}</p>
               {researchUrl && (
                 <Button onClick={() => window.open(researchUrl, '_blank')} variant="outline">
                    View on MyNeta Directly <ExternalLink className="w-4 h-4 ml-2" />
                 </Button>
               )}
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`p-6 border-2 ${data.criminalCases > 0 ? 'border-red-200 bg-red-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Criminal Cases</span>
                    <AlertTriangle className={`w-5 h-5 ${data.criminalCases > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                  </div>
                  <p className={`text-4xl font-black ${data.criminalCases > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {data.criminalCases}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 italic">{data.criminalDetails || 'No declared cases'}</p>
                </Card>

                <Card className="p-6 border-2 border-primary-200 bg-primary-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Declared Assets</span>
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                  </div>
                  <p className="text-2xl font-black text-primary-700">
                    {data.assets}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Liquid & Immovable</p>
                </Card>

                <Card className="p-6 border-2 border-indigo-200 bg-indigo-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Education</span>
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-lg font-black text-indigo-700 leading-tight">
                    {data.education}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Qualification Level</p>
                </Card>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-primary-500" />
                  Financial Transparency Report
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-600">Total Assets</span>
                      <span className="text-sm font-black text-primary-600">{data.assets}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary-500 h-full w-[85%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-600">Total Liabilities</span>
                      <span className="text-sm font-black text-red-600">{data.liabilities}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[15%]"></div>
                    </div>
                  </div>
                </div>
                <p className="mt-8 text-xs text-slate-400 italic leading-relaxed">
                  * All data is sourced from candidate affidavits submitted to the Election Commission of India and parsed via MyNeta. This report is for research purposes only.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button className="flex-1 py-4" onClick={() => window.open(data.source, '_blank')}>
                  View Full Affidavit on MyNeta <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center">
               <Loader2 className="w-12 h-12 text-slate-200 animate-spin mb-4" />
               <p className="text-slate-400 font-medium">Preparing analysis...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between px-10">
          <p className="text-xs font-medium text-slate-400">Deep Research powered by ElectionEase Scraper v2.0</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Live Data Feed</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateResearchModal;
