import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, Type, Bookmark, Check } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTranslation } from 'react-i18next';

const AccessibilityToolbar = () => {
  const { highContrast, toggleHighContrast, fontSize, setFontSize } = useAccessibility();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const fontSizes = [
    { id: 'small', label: 'A-', size: 'text-sm' },
    { id: 'medium', label: 'A', size: 'text-base' },
    { id: 'large', label: 'A+', size: 'text-xl' }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 mb-6 w-72"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                 App Settings
               </h3>
               <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            </div>

            {/* High Contrast Toggle */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <Eye className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">High Contrast</span>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`w-12 h-6 rounded-full transition-all duration-500 relative shadow-inner ${highContrast ? 'bg-primary-600' : 'bg-slate-200'}`}
                >
                  <motion.div
                    animate={{ x: highContrast ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed leading-relaxed">
                Enhances visibility for those with low vision or light sensitivity.
              </p>
            </div>

            {/* Font Size Selector */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Type className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">Text Scaling</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {fontSizes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id)}
                    className={`py-3 rounded-2xl border-2 font-black transition-all transform active:scale-95 ${
                      fontSize === f.id 
                        ? 'bg-primary-600 border-primary-100 text-white shadow-lg shadow-primary-200' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <span className={f.size}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:rotate-12 ${
          isOpen ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-primary-600'
        } border-2`}
      >
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.5 }}
        >
            <Settings className="w-7 h-7" />
        </motion.div>
      </button>
    </div>
  );
};

export default AccessibilityToolbar;
