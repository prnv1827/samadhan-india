import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/' }: {to?: string;}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5"
      aria-label="Samadhan India — home">
      
      <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] bg-forest-700">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 3c-4.4 1.4-7 4.6-7 8.6C5 16.3 8.1 20 12 21c3.9-1 7-4.7 7-9.4 0-4-2.6-7.2-7-8.6Z"
            fill="#D5E6DD" />
          
          <path d="M12 5.5V20" stroke="#1A4436" strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M12 10.5 15.5 8M12 14.5 8.5 12"
            stroke="#1A4436"
            strokeWidth="1.4"
            strokeLinecap="round" />
          
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-[1.0625rem] font-semibold tracking-tight text-ink">
          Samadhan
        </span>
        <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">
          India
        </span>
      </span>
    </Link>);

}