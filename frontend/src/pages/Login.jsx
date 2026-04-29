import React, { useState, useId } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

// ── Sub-component: Accessible Input Field ────────────────────────────────────

/**
 * @component InputField
 * @description Labelled, accessible form input with icon and optional password toggle.
 */
const InputField = ({
  id,
  label,
  icon: Icon,
  type,
  name,
  placeholder,
  onChange,
  required,
  showToggle,
  onToggle,
  isVisible,
  error,
  autoComplete,
}) => (
  <div className="relative group">
    {/* Visually hidden label for accessibility */}
    <label htmlFor={id} className="sr-only">{label}</label>

    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors duration-200">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </div>

    <input
      id={id}
      name={name}
      type={showToggle ? (isVisible ? 'text' : 'password') : type}
      required={required}
      placeholder={placeholder}
      onChange={onChange}
      autoComplete={autoComplete}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full pl-11 pr-12 py-3.5 bg-slate-100/50 border rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm ${
        error
          ? 'border-red-400 focus:ring-red-400'
          : 'border-slate-200 focus:ring-primary-500 focus:bg-surface'
      }`}
    />

    {showToggle && (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
      >
        {isVisible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
      </button>
    )}

    {error && (
      <p id={`${id}-error`} role="alert" className="text-[10px] text-red-500 font-medium mt-1 ml-2 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const Login = () => {
  const emailId    = useId();
  const passwordId = useId();
  const nameId     = useId();
  const formErrorId = useId();

  const [isRegister,    setIsRegister]    = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [formData,      setFormData]      = useState({ name: '', email: '', password: '' });
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formError,     setFormError]     = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { t }    = useTranslation();

  // ── Password strength validation ───────────────────────────────────────────
  const validatePassword = (pass) => {
    if (pass.length < 8)                  return 'Must be at least 8 characters.';
    if (!/[A-Z]/.test(pass))              return 'Must contain an uppercase letter.';
    if (!/[0-9]/.test(pass))              return 'Must contain a number.';
    if (!/[!@#$%^&*]/.test(pass))         return 'Must contain a special character (!@#$%^&*).';
    return '';
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
    if (isRegister && e.target.name === 'password') {
      setPasswordError(validatePassword(e.target.value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isRegister) {
      const pwErr = validatePassword(formData.password);
      if (pwErr) { setPasswordError(pwErr); return; }
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
      const data = err?.response?.data;
      const resMsg = data?.error || (data?.errors && data.errors.join(' '));
      const resStack = data?.stack;
      
      const fallback = isRegister 
        ? 'Registration failed. Please try again.' 
        : 'Authentication failed. Please check your credentials.';
        
      const msg = resMsg || fallback;
      
      // In development, show the first line of the stack trace for easier debugging
      setFormError(resStack 
        ? `${msg} (${resStack.split('\n')[0]})` 
        : msg
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsRegister((v) => !v);
    setPasswordError('');
    setFormError('');
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary-500/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Page heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary-100/10 border border-primary-500/20 text-primary-500 px-4 py-2 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Civic Portal</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isRegister ? t('create_account') || 'Create Account' : t('welcome_back') || 'Welcome Back'}
          </h1>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
          {/* Global form error */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                id={formErrorId}
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl px-4 py-3 mb-4"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {formError}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
            aria-describedby={formError ? formErrorId : undefined}
          >
            {/* Name field (register only) */}
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <InputField
                    id={nameId}
                    label="Full name"
                    icon={User}
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              id={emailId}
              label="Email address"
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email address"
              onChange={handleChange}
              required
              autoComplete={isRegister ? 'email' : 'username'}
            />

            <div className="space-y-1">
              <InputField
                id={passwordId}
                label="Password"
                icon={Lock}
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                showToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                error={isRegister && passwordError ? passwordError : undefined}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />

              {!isRegister && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-[10px] text-slate-500 hover:text-primary-500 font-bold uppercase tracking-tight focus:outline-none focus-visible:underline"
                    onClick={() => setFormError('A password reset link has been sent to your email (demo).')}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-2xl font-black shadow-xl"
                disabled={isSubmitting}
                loading={isSubmitting}
                aria-label={isRegister ? 'Create account' : 'Sign in to your account'}
              >
                {!isSubmitting && (
                  <>
                    {isRegister ? <UserPlus className="w-4 h-4" aria-hidden="true" /> : <LogIn className="w-4 h-4" aria-hidden="true" />}
                    <span>{isRegister ? t('create_account') || 'Create Account' : t('signin') || 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
                {isSubmitting && <span>{isRegister ? 'Creating account…' : 'Signing in…'}</span>}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100/10 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-slate-500 hover:text-primary-500 font-semibold transition-colors focus:outline-none focus-visible:underline"
            >
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <span className="text-primary-500 underline underline-offset-2">
                {isRegister ? t('signin') || 'Sign in' : 'Sign up free'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our{' '}
          <a href="#terms"   className="text-primary-500 font-semibold hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#privacy" className="text-primary-500 font-semibold hover:underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </main>
  );
};

export default Login;
