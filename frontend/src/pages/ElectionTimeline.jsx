import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, Circle } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import API_URL from '../config/api';

const TimelineSkeleton = () => (
  <div className="max-w-6xl mx-auto py-16 px-4">
    <Skeleton className="h-10 w-48 mb-12 rounded-full" />
    <Skeleton className="h-16 w-3/4 mb-4" />
    <Skeleton className="h-6 w-1/2 mb-16" />
    <div className="grid lg:grid-cols-4 gap-16">
      <div className="lg:col-span-3 space-y-12">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  </div>
);

const ElectionTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axios.get(`${API_URL}/elections/${id}`);
        setElection(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [id]);

  if (loading) return <TimelineSkeleton />;
  if (!election) return (
    <div className="max-w-xl mx-auto py-32 px-4 text-center">
        <div className="p-12 glass-card rounded-[3rem] border border-red-100">
            <h2 className="text-2xl font-black text-red-600 mb-2">{t('no_election_data')}</h2>
            <p className="text-slate-500 mb-6">We couldn't find details for this election event.</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
        </div>
    </div>
  );

  const getLocalized = (field) => {
    if (!field) return '';
    return field[i18n.language] || field['en'] || '';
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6">
      <motion.button 
        whileHover={{ x: -4 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-slate-400 hover:text-primary-500 transition-colors mb-12 group bg-surface px-4 py-2 rounded-full shadow-sm border border-slate-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm uppercase tracking-widest">{t('back_to_dashboard')}</span>
      </motion.button>

      <div className="mb-16">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="premium-gradient p-1 w-20 h-2 rounded-full mb-6"
        ></motion.div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          {getLocalized(election.title)}
        </h1>
        <div className="flex flex-wrap gap-6 text-slate-600 font-semibold uppercase tracking-widest text-xs">
          <div className="flex items-center bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/50">
            <Calendar className="w-4 h-4 mr-2 text-primary-500" />
            <span>{new Date(election.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'hi-IN')}</span>
          </div>
          <div className="flex items-center bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/50">
            <MapPin className="w-4 h-4 mr-2 text-primary-500" />
            <span>{election.state || 'National'} {election.district ? ` - ${election.district}` : ''}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-16 lg:grid-cols-4">
        {/* Stages Timeline */}
        <div className="lg:col-span-3">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-12 flex items-center tracking-tight">
            <div className="w-10 h-10 rounded-2xl bg-primary-100/20 flex items-center justify-center mr-4 shadow-sm">
               <Calendar className="w-5 h-5 text-primary-500" />
            </div>
            {t('election_stages')}
          </h2>
          
          <div className="space-y-0 relative">
            {/* Timeline connector line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-1.5 bg-slate-100/50 rounded-full" />
            
            {election.steps.sort((a, b) => a.order - b.order).map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-24 pb-16 last:pb-0 group"
              >
                <div className={`absolute left-0 w-14 h-14 rounded-2xl border-4 border-surface shadow-md flex items-center justify-center z-10 transition-all duration-500 group-hover:scale-110 ${
                  idx === 0 ? 'premium-gradient text-white shadow-primary-200' : 'bg-surface text-slate-400'
                }`}>
                  {idx === 0 ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-6 h-6" />}
                </div>
                
                <div className="glass-card p-8 rounded-3xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:border-primary-100">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">{getLocalized(step.title)}</h3>
                    {idx === 0 && (
                      <span className="bg-[var(--status-info-bg)] text-[var(--status-info-text)] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--status-info-text)]/20">
                        Current Stage
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-lg mb-8 leading-relaxed">{getLocalized(step.description)}</p>
                  
                  {step.actionLink && (
                    <motion.a 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={step.actionLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg"
                    >
                      {t('get_started')}
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-8">
            <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {t('candidate_platforms')}
                </h3>
                <div className="space-y-4">
                    {election.candidates.map((cand, i) => (
                        <div key={i} className="p-4 bg-surface rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-primary-500 block mb-1">{cand.party}</span>
                            <h4 className="font-bold text-slate-800 text-sm mb-2">{cand.name}</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {(cand.platform || []).map((p, j) => (
                                    <span key={j} className="text-[10px] bg-surface text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {t('polling_station_info')}
                </h3>
                <div className="space-y-4">
                    {election.pollingStations.slice(0, 2).map((station, i) => (
                        <div key={i} className="p-4 bg-surface border border-slate-100 rounded-xl shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{station.name}</h4>
                            <p className="text-slate-500 text-xs truncate mb-2">{station.address}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {station.accessibilityFeatures.map((f, j) => (
                                    <span key={j} className="text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded font-bold">
                                        {f}
                                    </span>
                                ))}
                            </div>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.name + ' ' + station.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black text-primary-600 hover:text-primary-700 flex items-center uppercase tracking-tighter"
                            >
                                <MapPin className="w-3 h-3 mr-1" />
                                View on Google Maps
                            </a>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default ElectionTimeline;
