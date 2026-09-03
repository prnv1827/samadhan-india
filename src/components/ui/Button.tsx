import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const base =
'inline-flex items-center justify-center gap-2 rounded-card font-medium whitespace-nowrap transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-soft active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
  'bg-forest-700 text-white border border-forest-700 hover:bg-forest-800 hover:border-forest-800 shadow-raise',
  accent:
  'bg-clay-400 text-white border border-clay-400 hover:bg-clay-500 hover:border-clay-500 shadow-raise',
  secondary:
  'bg-surface text-ink border border-line hover:border-forest-300 hover:bg-forest-50',
  ghost: 'text-ink-soft hover:text-forest-700 hover:bg-forest-50'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base'
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>);

}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children
}: CommonProps & {to: string;}) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>);

}