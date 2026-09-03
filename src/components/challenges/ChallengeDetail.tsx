import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, HeartIcon, MapPinIcon } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../ui/Button';
import { statusMeta, statusOrder } from '../../data/taxonomy';
import type { Challenge } from '../../types';
import { cn } from '../../utils/cn';
import { useChallenges } from '../../contexts/ChallengeContext';

function Fact({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>);

}

export function ChallengeDetail({
  challenge,
  backTo,
  backLabel




}: {challenge: Challenge;backTo: string;backLabel: string;}) {
  const [supported, setSupported] = useState(false);
  const { supportChallenge } = useChallenges();
  const [supporting, setSupporting] = useState(false);
  const currentIndex = statusOrder.indexOf(challenge.status);
  const upcoming = statusOrder.slice(currentIndex + 1);

  return (
    <div>
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-soft hover:text-forest-700">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
          <span className="font-semibold text-forest-600">{challenge.domain}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {challenge.city}, {challenge.district}, {challenge.state} — {challenge.pincode}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-xs">{challenge.reference}</span>
        </div>
        <h1 className="mt-4 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
          {challenge.title}
        </h1>
        <div className="mt-5">
          <StatusBadge status={challenge.status} />
        </div>
      </header>

      <div className="grid gap-12 pt-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Reported problem
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
            {challenge.description}
          </p>

          {challenge.mediaUrl &&
          <figure className="mt-7">
              <img
              src={challenge.mediaUrl}
              alt={`Photo submitted with the report: ${challenge.title}`}
              className="w-full rounded-card border border-line object-cover" />
            
              <figcaption className="mt-2 text-xs text-ink-muted">
                Submitted by {challenge.submittedBy}
              </figcaption>
            </figure>
          }

          {challenge.teamApplication && <section className="mt-10 rounded-card border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">University solution</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold">{challenge.solution?.title || 'Solution not submitted yet'}</h2>
            <p className="mt-2 text-sm text-ink-soft">Team: {challenge.teamApplication.teamName} · {challenge.teamApplication.university} · Team status: {challenge.teamApplication.status}</p>
            {challenge.solution && <><p className="mt-3 text-sm leading-relaxed text-ink-soft">{challenge.solution.description}</p><p className="mt-2 text-xs font-semibold text-forest-700">Solution status: {challenge.solution.status}</p></>}
            {challenge.collaborationProposals?.some(p=>p.status==='accepted') && <p className="mt-3 text-sm font-semibold text-forest-700">Industry collaboration accepted: {challenge.collaborationProposals.find(p=>p.status==='accepted')?.company}</p>}
            {challenge.completionSubmission?.status==='approved' && <p className="mt-3 rounded-card bg-forest-50 p-3 text-sm font-semibold text-forest-700">✓ Completion verified by Admin — RESOLVED</p>}
          </section>}

          <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Updates
          </h2>
          <ol className="mt-5">
            {challenge.timeline.map((entry, index) =>
            <li key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white',
                    statusMeta[entry.status].dot
                  )}
                  aria-hidden="true">
                  
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {(index < challenge.timeline.length - 1 || upcoming.length > 0) &&
                <span aria-hidden="true" className="w-px flex-1 bg-line" />
                }
                </div>
                <div className="pb-7">
                  <p className="font-semibold text-ink">{entry.label}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {entry.actor} · {entry.date}
                  </p>
                  {entry.note &&
                <p className="mt-2 max-w-xl rounded-card border border-line bg-surface p-3 text-sm leading-relaxed text-ink-soft">
                      {entry.note}
                    </p>
                }
                </div>
              </li>
            )}

            {upcoming.map((status, index) =>
            <li key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 rounded-full border border-dashed border-line bg-canvas" />
                
                  {index < upcoming.length - 1 &&
                <span aria-hidden="true" className="w-px flex-1 bg-line" />
                }
                </div>
                <div className="pb-7">
                  <p className="font-medium text-ink-muted">
                    {statusMeta[status].label}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">Not started yet</p>
                </div>
              </li>
            )}
          </ol>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-5">
            <p className="font-serif text-2xl font-semibold text-ink">
              {challenge.supporters + (supported ? 1 : 0)}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              people have reported or backed this problem
            </p>
            <Button
              variant={supported ? 'secondary' : 'accent'}
              className="mt-4 w-full"
              onClick={async () => { if (supported || supporting) return; setSupporting(true); try { await supportChallenge(challenge.id); setSupported(true); } finally { setSupporting(false); } }}
              aria-pressed={supported}>
              
              <HeartIcon
                className={cn('h-4 w-4', supported && 'fill-clay-400 text-clay-400')}
                aria-hidden="true" />
              
              {supported ? 'You backed this' : supporting ? 'Adding support…' : 'I have this problem too'}
            </Button>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Backing instead of filing a fresh report keeps the record clean and
              raises this challenge&apos;s routing priority.
            </p>
          </div>

          <dl className="mt-6 divide-y divide-line rounded-card border border-line bg-surface px-5 py-2">
            <Fact label="Reference" value={<span className="font-mono text-xs">{challenge.reference}</span>} />
            <Fact label="Reported by" value={challenge.submittedBy} />
            <Fact label="Submitted" value={challenge.submittedAt} />
            <Fact label="Duplicates merged" value={challenge.duplicatesMerged} />
            <Fact
              label="Working on it"
              value={challenge.assignedTo ?? 'Not routed yet'} />
            
          </dl>
        </aside>
      </div>
    </div>);

}