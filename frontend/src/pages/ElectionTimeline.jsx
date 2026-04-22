import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, Circle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ElectionTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/elections/${id}`);
        setElection(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [id]);

  if (loading) return <div className="text-center p-20 animate-pulse text-slate-400">Loading timeline...</div>;
  if (!election) return <div className="text-center p-20 text-red-500 font-bold">{t('no_election_data')}</div>;

  const getLocalized = (field) => {
    if (!field) return '';
    return field[i18n.language] || field['en'] || '';
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-slate-500 hover:text-primary-600 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">{t('back_to_dashboard')}</span>
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{getLocalized(election.title)}</h1>
        <div className="flex flex-wrap gap-4 text-slate-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary-500" />
            <span>{new Date(election.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'hi-IN')}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-primary-500" />
            <span>{election.state || 'National'} {election.district ? ` - ${election.district}` : ''}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Stages Timeline */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
               <Calendar className="w-4 h-4 text-primary-600" />
            </div>
            {t('election_stages')}
          </h2>
          
          <div className="space-y-0 relative">
            {/* Timeline connector line */}
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-200" />
            
            {election.steps.sort((a, b) => a.order - b.order).map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-16 pb-12 last:pb-0"
              >
                <div className={`absolute left-0 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${
                  idx === 0 ? 'bg-primary-600' : 'bg-slate-200'
                }`}>
                  {idx === 0 ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Circle className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{getLocalized(step.title)}</h3>
                  <p className="text-slate-500 text-sm mb-4">{getLocalized(step.description)}</p>
                  {step.actionLink && (
                    <a 
                      href={step.actionLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-primary-600 font-bold text-xs uppercase tracking-widest hover:text-primary-700 underline underline-offset-4"
                    >
                      {t('get_started')}
                    </a>
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
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-primary-600 block mb-1">{cand.party}</span>
                            <h4 className="font-bold text-slate-800 text-sm mb-2">{cand.name}</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {(cand.platform || []).map((p, j) => (
                                    <span key={j} className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
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
                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{station.name}</h4>
                            <p className="text-slate-500 text-xs truncate mb-2">{station.address}</p>
                            <div className="flex flex-wrap gap-1">
                                {station.accessibilityFeatures.map((f, j) => (
                                    <span key={j} className="text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded font-bold">
                                        {f}
                                    </span>
                                ))}
                            </div>
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
