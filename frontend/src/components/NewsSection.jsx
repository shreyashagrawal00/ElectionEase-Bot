import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { Newspaper, ExternalLink, Calendar, Loader2 } from 'lucide-react';

const NewsSection = ({ stateFilter }) => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/news?state=${stateFilter || ''}`);
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error('Frontend News Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [stateFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center space-x-2 mb-6">
        <Newspaper className="w-6 h-6 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('latest_news')}</h2>
          <p className="text-sm text-slate-500">{t('news_subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.length === 0 ? (
          <p className="col-span-full text-center text-slate-400 italic py-8">No recent election news found.</p>
        ) : (
          articles.slice(0, 6).map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-slate-100 overflow-hidden group">
                {article.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {article.source.name}
                    </span>
                    <div className="flex items-center text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 text-xs font-bold flex items-center hover:text-primary-700 transition-colors"
                    >
                      {t('read_more')}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsSection;
