import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { ChallengeCard } from '../../components/ChallengeCard';
import { ButtonLink } from '../../components/ui/Button';
import { useChallenges } from '../../contexts/ChallengeContext';
import { statusMeta, statusOrder } from '../../data/taxonomy';
import type { ChallengeStatus } from '../../types';
import { cn } from '../../utils/cn';

export function MySubmissions() {
  const { mine } = useChallenges();
  const [filter, setFilter] = useState<'all' | ChallengeStatus>('all');

  const counts = statusOrder.reduce<Record<string, number>>((accumulator, status) => {
    accumulator[status] = mine.filter((challenge) => challenge.status === status).length;
    return accumulator;
  }, {});

  const visible = filter === 'all' ? mine : mine.filter((c) => c.status === filter);
  const resolved = counts.resolved ?? 0;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            My submissions
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
            {mine.length} reports filed · {resolved} resolved. Open any one to see
            who is working on it and what has changed.
          </p>
        </div>
        <ButtonLink to="/citizen/submit">
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          New challenge
        </ButtonLink>
      </header>

      <div
        role="tablist"
        aria-label="Filter submissions by status"
        className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        
        {(['all', ...statusOrder] as Array<'all' | ChallengeStatus>).map((status) => {
          const active = filter === status;
          const count = status === 'all' ? mine.length : counts[status] ?? 0;
          return (
            <button
              key={status}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ease-soft',
                active ?
                'border-forest-700 bg-forest-700 text-white' :
                'border-line bg-surface text-ink-soft hover:border-forest-200 hover:text-forest-700'
              )}>
              
              {status === 'all' ? 'All' : statusMeta[status].label}
              <span className={cn('text-xs', active ? 'text-forest-100' : 'text-ink-muted')}>
                {count}
              </span>
            </button>);

        })}
      </div>

      {visible.length === 0 ?
      <div className="mt-8 rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
          <h2 className="font-serif text-xl font-semibold text-ink">
            {mine.length === 0 ? 'You have not reported anything yet' : 'Nothing at this stage'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            {mine.length === 0 ?
          'A report takes about two minutes. Describe one problem, add a photo, pick your district.' :
          'None of your submissions are at this stage right now.'}
          </p>
          {mine.length === 0 &&
        <ButtonLink to="/citizen/submit" className="mt-6">
              Report a challenge
            </ButtonLink>
        }
        </div> :

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((challenge) =>
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          to={`/citizen/submissions/${challenge.id}`} />

        )}
        </div>
      }
    </div>);

}