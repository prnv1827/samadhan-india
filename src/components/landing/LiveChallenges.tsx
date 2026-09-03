import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { ChallengeCard } from '../ChallengeCard';
import { useChallenges } from '../../contexts/ChallengeContext';

export function LiveChallenges() {
  const { all } = useChallenges();
  const featured = all.slice(0, 3);

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Open right now
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Every challenge is public. Duplicate reports are merged, so the
              support count shows how many people are living with the same
              problem.
            </p>
          </div>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 transition-colors duration-150 ease-soft hover:text-clay-500">
            
            Browse all challenges
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((challenge) =>
              <ChallengeCard key={challenge.id} challenge={challenge} to={`/challenges/${challenge.id}`} />
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-card border border-dashed border-line bg-white/60 px-6 py-10 text-center">
            <p className="font-serif text-xl font-semibold text-ink">No challenges have been submitted yet.</p>
            <p className="mt-2 text-sm text-ink-muted">Be the first person to report a local problem and put it on the public record.</p>
          </div>
        )}
      </div>
    </section>);

}