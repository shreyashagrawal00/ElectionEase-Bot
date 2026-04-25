import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';

const InputField = ({ icon: Icon, type, name, placeholder, onChange, required, showToggle, onToggle, isVisible }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors duration-200">
      <Icon className="w-4 h-4" />
    </div>
    <input
      name={name}
      type={isVisible ? 'text' : type}
      required={required}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full pl-11 pr-12 py-3.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-surface transition-all duration-200 shadow-sm"
    />
    {showToggle && (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    )}
  </div>
);

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pass)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain a number';
    if (!/[!@#$%^&*]/.test(pass)) return 'Password must contain a special character (!@#$%^&*)';
    return '';
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (isRegister && e.target.name === 'password') {
      setPasswordError(validatePassword(e.target.value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      const error = validatePassword(formData.password);
      if (error) {
        setPasswordError(error);
        return;
      }
    }

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
      {/* Background decorations omitted for brevity */}
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 text-primary-600 px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Secure Civic Portal</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Join ElectionEase' : 'Welcome Back'}
          </h1>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
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
            
            <div className="space-y-1">
              <InputField
                icon={Lock}
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                showToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
              {isRegister && passwordError && (
                <p className="text-[10px] text-red-500 font-bold ml-2">{passwordError}</p>
              )}
              {!isRegister && (
                <div className="flex justify-end">
                   <button 
                    type="button"
                    onClick={() => alert('Forgot Password feature: We have sent a recovery link to your email.')}
                    className="text-[10px] text-slate-400 hover:text-primary-600 font-bold uppercase tracking-tighter"
                   >
                     Forgot Password?
                   </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-4 text-base font-black rounded-2xl flex items-center justify-center space-x-2 shadow-xl hover:shadow-primary-300 transition-all"
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

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setPasswordError('');
              }}
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
