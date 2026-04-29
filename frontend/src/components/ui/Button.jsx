import React from 'react';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../context/AccessibilityContext';

/**
 * @component Button
 * @description Fully accessible, animated button component.
 *
 * Accessibility features:
 *  - Defaults to type="button" to prevent accidental form submissions
 *  - Respects `prefers-reduced-motion` via the AccessibilityContext
 *  - Supports aria-label, aria-describedby, and aria-busy (loading state)
 *  - Visible focus ring on all interactive states
 *  - Disabled state sets aria-disabled + prevents pointer events
 *
 * @param {object}   props
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClick]
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [props.variant='primary']
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string}   [props.className='']
 * @param {string}   [props.aria-label]
 * @param {string}   [props.aria-describedby]
 * @param {boolean}  [props.disabled=false]
 * @param {boolean}  [props.loading=false]   - shows spinner ring + aria-busy
 * @param {'sm'|'md'|'lg'} [props.size='md']
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  type    = 'button',
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  disabled  = false,
  loading   = false,
  size      = 'md',
  ...props
}) => {
  const { reduceMotion } = useAccessibility?.() || { reduceMotion: false };

  const isInteractive = !disabled && !loading;

  // ── Style maps ────────────────────────────────────────────────────────────
  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantMap = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-md hover:shadow-lg',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus-visible:ring-slate-400',
    outline:   'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
    ghost:     'bg-transparent shadow-none border-0 hover:bg-slate-100/80 focus-visible:ring-slate-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-md',
    white:     'bg-white text-[#0f172a] hover:bg-slate-50 focus-visible:ring-white shadow-xl',
  };

  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    sizeMap[size] || sizeMap.md,
    variantMap[variant] || variantMap.primary,
    className,
  ].join(' ');

  // ── Animation ─────────────────────────────────────────────────────────────
  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: isInteractive ? { scale: 1.02 } : {},
        whileTap:   isInteractive ? { scale: 0.97 } : {},
        transition: { duration: 0.15 },
      };

  return (
    <motion.button
      type={type}
      className={base}
      onClick={isInteractive ? onClick : undefined}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...motionProps}
      {...props}
    >
      {loading ? (
        <>
          {/* Accessible spinner */}
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>{children}</span>
          <span className="sr-only">Loading…</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
