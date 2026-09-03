import React from 'react';
import { cn } from '../../utils/cn';

const control =
'w-full rounded-card border border-line bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-ink-muted/70 transition-[border-color,box-shadow] duration-150 ease-soft hover:border-forest-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-100 focus:outline-none';

export function Label({
  htmlFor,
  children,
  hint,
  optional





}: {htmlFor: string;children: React.ReactNode;hint?: string;optional?: boolean;}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {children}
        {optional &&
        <span className="ml-1.5 font-normal text-ink-muted">optional</span>
        }
      </label>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>);

}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-11', className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'py-2.5 leading-relaxed', className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, 'h-11 pr-9', className)} {...rest}>
      {children}
    </select>);

}

export function FieldError({ children }: {children: React.ReactNode;}) {
  return <p className="mt-1.5 text-xs font-medium text-clay-500">{children}</p>;
}