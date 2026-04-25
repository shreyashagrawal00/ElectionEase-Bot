import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, UserPlus, CheckCircle } from 'lucide-react';
import Card from './ui/Card';

const VoterStats = () => {
  const stats = [
    { label: 'Total Registered', value: '96.8Cr', icon: Users, color: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)]' },
    { label: 'Youth Voters', value: '1.8Cr', icon: UserPlus, color: 'bg-primary-100 text-primary-600' },
    { label: 'Ready to Vote', value: '82%', icon: CheckCircle, color: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]' },
    { label: 'Engagement', value: '+12%', icon: TrendingUp, color: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)]' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
          <Card className="flex items-center p-8 bg-surface transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border-slate-100/50">
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
