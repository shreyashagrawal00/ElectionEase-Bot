import React from 'react';
import { motion } from 'framer-motion';

/**
 * @component Skeleton
 * @description A flexible, animated skeleton loader for content placeholders.
 */
const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "bg-slate-200 animate-pulse-subtle";
  
  const variantClasses = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 w-full mb-2",
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.rect} ${className}`}
      aria-hidden="true"
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
    <div className="flex flex-col lg:flex-row justify-between mb-12 gap-8">
      <div className="space-y-4">
        <Skeleton variant="text" className="h-10 w-64" />
        <Skeleton variant="text" className="h-6 w-96" />
      </div>
      <Skeleton className="h-28 w-full max-w-md rounded-3xl" />
    </div>
    
    <div className="grid gap-6 md:grid-cols-3 mb-12">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>

    <div className="mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
      <Skeleton className="h-[500px] rounded-[2.5rem]" />
      <div className="space-y-10">
        <Skeleton className="h-48 rounded-[2rem]" />
        <Skeleton className="h-64 rounded-[2.5rem]" />
      </div>
    </div>
  </div>
);

export default Skeleton;
