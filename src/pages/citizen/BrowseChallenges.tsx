import React from 'react';
import { ChallengeBrowser } from '../../components/challenges/ChallengeBrowser';
import { useChallenges } from '../../contexts/ChallengeContext';

export function BrowseChallenges() {
  const { all } = useChallenges();

  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Challenges across India
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Every report is public. Find the ones near you, back what you are also
          living with, and see which universities have picked them up.
        </p>
      </header>
      <div className="mt-8">
        <ChallengeBrowser challenges={all} linkBase="/citizen/browse" />
      </div>
    </div>);

}