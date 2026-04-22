import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, UserPlus, CheckCircle } from 'lucide-react';
import Card from './ui/Card';

const VoterStats = () => {
  const stats = [
    { label: 'Total Registered', value: '96.8Cr', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Youth Voters', value: '1.8Cr', icon: UserPlus, color: 'bg-primary-100 text-primary-600' },
    { label: 'Ready to Vote', value: '82%', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Engagement', value: '+12%', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="flex items-center p-6 bg-white transition-all hover:scale-105">
              <div className={`p-4 rounded-2xl mr-4 ${stat.color} shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default VoterStats;
