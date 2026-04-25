import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, MapPin, CheckCircle2 } from 'lucide-react';

const KnowledgeBase = () => {
  const { t, i18n } = useTranslation();
  const [elections, setElections] = useState([]);
  const [checkedDocs, setCheckedDocs] = useState({});

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/elections');
        setElections(res.data);
      } catch(err) { console.error(err); }
    };
    fetchElections();
  }, []);

  const getLocalized = (field) => {
    if (!field) return '';
    return field[i18n.language] || field['en'] || '';
  };

  const docCategories = [
    { title: t('identity_proof'), docs: ['doc_aadhaar', 'doc_pan', 'doc_passport', 'doc_driving'] },
    { title: t('address_proof'), docs: ['doc_aadhaar', 'doc_utility', 'doc_passbook', 'doc_ration'] },
    { title: t('age_proof'), docs: ['doc_aadhaar', 'doc_birth', 'doc_passport'] }
  ];

  const handleToggleDoc = (doc) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-12 text-center max-w-3xl mx-auto">
         <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight sm:text-5xl">
           {t('kb_title')}
         </h1>
         <p className="text-lg text-slate-500 leading-relaxed">
           {t('kb_subtitle')}
         </p>
      </div>

      {/* Required Documents Section */}
      <div className="mb-16">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-slate-900">{t('docs_check_title')}</h2>
        </div>
        <p className="text-slate-500 mb-8">{t('docs_check_subtitle')}</p>
        
        <div className="grid gap-8 md:grid-cols-3">
          {docCategories.map((category, idx) => (
            <Card key={idx} className="p-6 bg-surface border-slate-100/50 hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-4">
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.docs.map(doc => (
                  <li key={doc} className="flex items-start cursor-pointer" onClick={() => handleToggleDoc(doc)}>
                    <div className={`mt-0.5 mr-3 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      checkedDocs[doc] ? 'bg-primary-600 border-primary-600' : 'bg-surface border-slate-300'
                    }`}>
                      {checkedDocs[doc] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${checkedDocs[doc] ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                      {t(doc)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Elections & Candidates Section */}
      {elections.map(election => (
        <div key={election._id} className="mb-16">
          <div className="flex items-center space-x-2 mb-8 border-b border-slate-200 pb-4">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {getLocalized(election.title)} - {t('browse_candidates')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {election.candidates.map((cand, idx) => (
               <Card key={idx} className="p-6 bg-surface border-slate-100 group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-[var(--status-info-bg)] text-[var(--status-info-text)] rounded-full text-xs font-bold uppercase tracking-wide transition-colors">
                      {cand.party}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{cand.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-3">
                    {getLocalized(cand.bio)}
                  </p>
                  <div className="pt-4 border-t border-slate-50">
                    <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-3">{t('step_2')}</h4>
                    <ul className="space-y-2">
                      {(cand.platform || []).map((plat, i) => (
                        <li key={i} className="flex items-center text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-2" />
                          {plat}
                        </li>
                      ))}
                    </ul>
                  </div>
               </Card>
            ))}
          </div>

          <div className="flex items-center space-x-2 mt-16 mb-8 border-b border-slate-200 pb-4">
            <MapPin className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-slate-900">{t('step_3')}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {election.pollingStations.map((station, idx) => (
                <Card key={idx} className="p-6 bg-surface border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">{station.name}</h3>
                  <div className="flex items-start mt-2 text-slate-500">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm italic">{station.address}</p>
                  </div>
                  <div className="mt-6">
                     <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-3">Accessibility</h4>
                     <div className="flex flex-wrap gap-2">
                        {station.accessibilityFeatures.map((feat, i) => (
                           <span key={i} className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md text-[10px] font-bold ring-1 ring-inset ring-primary-700/10">
                             {feat}
                           </span>
                        ))}
                     </div>
                  </div>
                </Card>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KnowledgeBase;
