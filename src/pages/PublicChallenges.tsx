import React from 'react';
import { useParams } from 'react-router-dom';
import { PublicNav } from '../components/PublicNav';
import { ChallengeBrowser } from '../components/challenges/ChallengeBrowser';
import { ChallengeDetail } from '../components/challenges/ChallengeDetail';
import { ButtonLink } from '../components/ui/Button';
import { useChallenges } from '../contexts/ChallengeContext';

function Frame({ children }: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen w-full bg-canvas">
      <PublicNav />
      <main className="mx-auto w-full max-w-[1200px] px-6 py-12">{children}</main>
    </div>);

}

export function PublicChallenges() {
  const { all } = useChallenges();

  return (
    <Frame>
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink">
          Every challenge on the record
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Nothing here is hidden. Filter by district or domain to see what people
          around you have reported and where each problem has reached.
        </p>
        <ButtonLink to="/signup" className="mt-6">
          Report one of your own
        </ButtonLink>
      </header>
      <div className="mt-10">
        <ChallengeBrowser challenges={all} linkBase="/challenges" />
      </div>
    </Frame>);

}

export function PublicChallengeDetail() {
  const { id } = useParams();
  const { getById, ready } = useChallenges();
  const challenge = id ? getById(id) : undefined;

  if (!ready) { return <div className="mx-auto max-w-lg py-20 text-center text-sm text-ink-muted">Loading challenge…</div>; }

  if (!challenge) {
    return (
      <Frame>
        <div className="mx-auto max-w-lg py-20 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink">
            That challenge could not be found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            It may have been merged into another report during de-duplication.
          </p>
          <ButtonLink to="/challenges" variant="secondary" className="mt-6">
            Back to all challenges
          </ButtonLink>
        </div>
      </Frame>);

  }

  return (
    <Frame>
      <ChallengeDetail
        challenge={challenge}
        backTo="/challenges"
        backLabel="Back to all challenges" />
      
    </Frame>);

}