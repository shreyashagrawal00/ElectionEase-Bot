import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Settings, Info, LogOut, Globe, Users, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleHighContrast } = useAccessibility();
  const { t, i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="flex items-center text-2xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-105">
                <CheckCircle2 className="w-8 h-8 text-primary-600 mr-2" strokeWidth={2.5} />
                <span className="text-primary-600">Election</span>
                <span className="text-accent-500">Ease</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1">
              <Globe className="h-4 w-4 text-slate-500 mr-1" />
              <select 
                onChange={changeLanguage} 
                value={i18n.language}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            <button 
              onClick={toggleHighContrast}
              className="p-2 text-slate-500 hover:text-slate-700 focus:outline-none"
              aria-label="Toggle High Contrast"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <Link to="/knowledge" className="text-slate-500 hover:text-slate-700 hidden sm:flex items-center">
              <Info className="h-5 w-5 mr-1" />
              <span>Info</span>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-700 hover:text-primary-600 font-medium hidden sm:block">Dashboard</Link>
                <Link to="/candidates" className="text-slate-700 hover:text-primary-600 font-medium hidden sm:flex items-center">
                  <span>Candidates</span>
                </Link>
                <Button variant="outline" onClick={logout} className="flex items-center text-sm px-3 py-1">
                  <LogOut className="h-4 w-4 mr-1 lg:mr-2" /> 
                  <span className="hidden lg:inline">{t('logout')}</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="px-4 py-2 text-sm">{t('get_started')}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
