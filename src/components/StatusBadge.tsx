import React from 'react';
import { statusMeta } from '../data/taxonomy';
import type { ChallengeStatus } from '../types';
import { cn } from '../utils/cn';

export function StatusBadge({
  status,
  className



}: {status: ChallengeStatus;className?: string;}) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        meta.chip,
        meta.text,
        className
      )}>
      
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>);

}