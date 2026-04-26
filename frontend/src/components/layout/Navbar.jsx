import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Moon, Sun, Info, LogOut, Globe, Users, CheckCircle2, Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleHighContrast, darkMode, toggleDarkMode } = useAccessibility();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="flex items-center text-xl md:text-2xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-105">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-primary-600 mr-2" strokeWidth={2.5} />
                <span className="text-primary-600">Election</span>
                <span className="text-accent-500">Ease</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className={`flex items-center rounded-lg px-3 py-1.5 border ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-200/60 border-slate-300/30'}`}>
              <Globe className={`h-4 w-4 mr-2 ${darkMode ? 'text-slate-400' : 'text-[#000000]'}`} />
              <select 
                onChange={changeLanguage} 
                value={i18n.language}
                className={`bg-transparent text-sm font-bold focus:outline-none cursor-pointer ${darkMode ? 'text-white' : 'text-[#000000]'}`}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>

            <button 
              onClick={toggleDarkMode}
              className={`p-2 hover:text-primary-600 focus:outline-none transition-transform active:scale-90 ${darkMode ? 'text-slate-100' : 'text-[#000000]'}`}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-[#000000]" />}
            </button>

            {user ? (
              <>
                <Link to="/dashboard" className={`hover:text-primary-600 font-bold transition-colors ${darkMode ? 'text-white' : 'text-[#000000]'}`}>{t('dashboard') || 'Dashboard'}</Link>
                <Link to="/candidates" className={`hover:text-primary-600 font-bold transition-colors ${darkMode ? 'text-white' : 'text-[#000000]'}`}>{t('candidates') || 'Candidates'}</Link>
                <Button variant="outline" onClick={logout} className={`flex items-center text-sm px-4 py-2 font-bold ${darkMode ? 'border-white text-white' : 'border-[#000000] text-[#000000]'}`}>
                  <LogOut className="h-4 w-4 mr-2" /> 
                  <span>{t('logout')}</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="px-6 py-2 text-sm font-bold">{t('signin') || 'Sign In'}</Button>
              </Link>
            )}
          </div>


          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-black"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-black" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-black dark:text-slate-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-b overflow-hidden ${darkMode ? 'bg-[#050810] border-slate-800' : 'bg-white border-slate-200/50'}`}
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-slate-500 mr-2" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Language</span>
                </div>
                <select 
                  onChange={changeLanguage} 
                  value={i18n.language}
                  className="bg-transparent text-sm font-bold text-primary-600 focus:outline-none cursor-pointer"
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="mr">MR</option>
                  <option value="gu">GU</option>
                  <option value="bn">BN</option>
                  <option value="ta">TA</option>
                  <option value="te">TE</option>
                  <option value="kn">KN</option>
                  <option value="ml">ML</option>
                </select>
              </div>

              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block p-3 text-lg font-bold hover:bg-slate-100/50 rounded-xl ${darkMode ? 'text-white' : 'text-[#000000]'}`}>Dashboard</Link>
                  <Link to="/candidates" onClick={() => setIsMenuOpen(false)} className={`block p-3 text-lg font-bold hover:bg-slate-100/50 rounded-xl ${darkMode ? 'text-white' : 'text-[#000000]'}`}>Candidates</Link>
                  <Link to="/knowledge" onClick={() => setIsMenuOpen(false)} className={`block p-3 text-lg font-bold hover:bg-slate-100/50 rounded-xl ${darkMode ? 'text-white' : 'text-[#000000]'}`}>Info Center</Link>
                  <div className="pt-4">
                    <Button onClick={logout} className="w-full py-4 rounded-2xl justify-center font-bold">
                      <LogOut className="h-5 w-5 mr-2" />
                      {t('logout')}
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block pt-2">
                  <Button className="w-full py-4 rounded-2xl justify-center font-bold">{t('signin') || 'Sign In'}</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
