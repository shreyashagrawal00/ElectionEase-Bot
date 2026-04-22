import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Settings, Info, LogOut, CheckCircle, Globe } from 'lucide-react';
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
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CheckCircle className="h-8 w-8 text-primary-600 mr-2" />
              <span className="font-bold text-xl text-slate-900 leading-tight hidden xs:block">
                ElectionEase
              </span>
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
                <Link to="/dashboard" className="text-slate-700 hover:text-primary-600 font-medium hidden xs:block">Dashboard</Link>
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
