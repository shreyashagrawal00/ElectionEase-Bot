import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapData from '../../assets/map_data.json';

const IndiaMap = ({ selectedState, onSelectState }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setTooltipPos({ 
      x: e.clientX, 
      y: e.clientY,
      nearTop: e.clientY < 130 
    });
  };

  return (
    <div className="relative w-full aspect-[612/696] max-w-2xl mx-auto cursor-crosshair group pt-4">
      <svg
        viewBox={mapData.viewBox}
        className="w-full h-full drop-shadow-2xl transition-all duration-700"
        onMouseMove={handleMouseMove}
      >
        <g stroke="#cbd5e1" strokeWidth="0.5">
          {mapData.locations.map((loc) => {
            const isSelected = selectedState === loc.name;
            const isHovered = hoveredState === loc.name;

            return (
              <motion.path
                key={loc.id}
                d={loc.path}
                initial={{ fill: "#f8fafc", scale: 1 }}
                animate={{
                  fill: isSelected ? "#16a34a" : (isHovered ? "#dcfce7" : "#f1f5f9"),
                  scale: isSelected ? 1.02 : 1,
                  stroke: isSelected ? "#15803d" : "#cbd5e1",
                  strokeWidth: isSelected || isHovered ? 1.5 : 0.5,
                }}
                whileHover={{ 
                    scale: isSelected ? 1.02 : 1.005,
                    zIndex: 10,
                }}
                onClick={() => onSelectState(isSelected ? '' : loc.name)}
                onMouseEnter={() => setHoveredState(loc.name)}
                onMouseLeave={() => setHoveredState(null)}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="transition-colors duration-200"
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ 
              position: 'fixed', 
              left: tooltipPos.x,
              top: tooltipPos.nearTop ? tooltipPos.y + 25 : tooltipPos.y - 85,
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
            className="z-[100] px-6 py-4 bg-white border border-slate-200 text-slate-800 rounded-[1.25rem] shadow-xl flex flex-col items-start pointer-events-none min-w-[140px]"
          >
            <span className="whitespace-nowrap text-lg font-black tracking-tight">{hoveredState}</span>
            <span className="text-[10px] uppercase tracking-widest text-primary-600 font-bold mt-1.5">
              CLICK TO FOCUS
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Map Legend/Instructions Overlay */}
      <div className="absolute top-2 left-0 flex flex-col space-y-2 pointer-events-none p-4 rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-600 shadow-sm shadow-primary-200"></div>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Active Focus</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">State Territory</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200/50">
            <p className="text-[9px] text-slate-500 font-medium italic">Select a state to filter dashboard data</p>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
