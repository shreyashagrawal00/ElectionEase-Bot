import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIA_MAP_DATA } from '../config/mapData';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * @component IndiaMap
 * @description A high-performance, accessible interactive map of India.
 * 
 * Features:
 * - Decoupled SVG path data (loaded from config)
 * - Optimized rendering via useMemo
 * - Accessibility: keyboard navigation (tabIndex, onKeyDown), aria-labels
 * - Respects AccessibilityContext (reduceMotion)
 * - Premium hover effects and focus states
 */
const IndiaMap = ({ onSelectState, selectedState }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const { reduceMotion } = useAccessibility();

  // ── Keyboard handling for accessibility ─────────────────────────────────────
  const handleKeyDown = useCallback((e, stateName) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectState(stateName);
    }
  }, [onSelectState]);

  // ── Memoized paths to prevent unnecessary re-renders ────────────────────────
  const paths = useMemo(() => {
    return INDIA_MAP_DATA.locations.map((loc) => {
      const isSelected = selectedState === loc.name;
      const isHovered  = hoveredState === loc.name;

      // Color logic (using theme variables)
      let fill = 'var(--map-fill)';
      if (isSelected) fill = 'var(--map-selected)';
      else if (isHovered) fill = 'var(--map-hover)';
      
      const stroke = isSelected ? "var(--color-white)" : "var(--map-stroke)";
      const strokeWidth = isSelected ? "1.5" : "0.5";

      return (
        <motion.path
          key={loc.id}
          d={loc.path}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          tabIndex={0}
          role="button"
          aria-label={`Select ${loc.name}`}
          aria-pressed={isSelected}
          onMouseEnter={() => setHoveredState(loc.name)}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onSelectState(loc.name)}
          onKeyDown={(e) => handleKeyDown(e, loc.name)}
          initial={false}
          animate={{ 
            fill, 
            scale: isHovered || isSelected ? 1.01 : 1,
            zIndex: isHovered || isSelected ? 10 : 1
          }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          className="cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        />
      );
    });
  }, [selectedState, hoveredState, onSelectState, handleKeyDown, reduceMotion]);

  return (
    <div className="relative w-full glass-card p-6 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Voter Impact Map</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select region for local insights</p>
        </div>
        
        <AnimatePresence mode="wait">
          {hoveredState && (
            <motion.div 
              key={hoveredState}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className="px-4 py-1.5 bg-primary-600 text-white font-black text-xs rounded-full shadow-lg border border-primary-500/20"
            >
              {hoveredState}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      <div className="relative">
        <svg 
          viewBox={INDIA_MAP_DATA.viewBox} 
          className="w-full h-auto filter drop-shadow-2xl"
          aria-label="Interactive map of India"
          role="group"
        >
          {/* Subtle background glow behind the map */}
          <circle cx="300" cy="350" r="250" fill="var(--primary-500)" fillOpacity="0.03" filter="blur(60px)" />
          
          {paths}
        </svg>
      </div>

      <footer className="mt-8 pt-4 border-t border-slate-100/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Available</span>
          </div>
        </div>
        
        <p className="text-[10px] text-slate-400 italic">
          Use Tab keys to navigate regions
        </p>
      </footer>
    </div>
  );
};

export default IndiaMap;
