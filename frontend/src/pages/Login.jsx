import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

const InputField = ({ icon: Icon, type, name, placeholder, onChange, required }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors duration-200">
      <Icon className="w-4 h-4" />
    </div>
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full pl-11 pr-4 py-3.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-surface transition-all duration-200 shadow-sm"
    />
  </div>
);

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Authentication failed. Please check your credentials.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-100/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-100/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-indigo-100/10 rounded-full blur-[80px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-[var(--status-info-bg)] border border-[var(--status-info-text)]/20 text-[var(--status-info-text)] px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-[0.15em]">Secure Civic Portal</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Join ElectionEase' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isRegister
              ? 'Create your account to start your civic journey'
              : 'Sign in to access your personalised dashboard'}
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <InputField
                    icon={User}
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email address"
              onChange={handleChange}
              required
            />
            <InputField
              icon={Lock}
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3.5 text-base font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary-200 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Please wait…</span>
                ) : (
                  <>
                    {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-slate-500 hover:text-primary-600 font-semibold transition-colors duration-200"
            >
              {isRegister
                ? 'Already have an account? '
                : "Don't have an account? "}
              <span className="text-primary-600 underline underline-offset-2">
                {isRegister ? 'Sign in' : 'Sign up free'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our{' '}
          <span className="text-primary-600 font-semibold cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-primary-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
