import React from 'react';
import { useParams } from 'react-router-dom';
import { ChallengeDetail } from '../../components/challenges/ChallengeDetail';
import { ButtonLink } from '../../components/ui/Button';
import { useChallenges } from '../../contexts/ChallengeContext';

export function SubmissionDetail({ from = 'submissions' }: {from?: 'submissions' | 'browse';}) {
  const { id } = useParams();
  const { getById, ready } = useChallenges();
  const challenge = id ? getById(id) : undefined;

  if (!ready) { return <div className="mx-auto max-w-lg py-20 text-center text-sm text-ink-muted">Loading challenge…</div>; }

  if (!challenge) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          That challenge could not be found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          It may have been merged into another report during de-duplication.
        </p>
        <ButtonLink to="/citizen/browse" variant="secondary" className="mt-6">
          Browse challenges
        </ButtonLink>
      </div>);

  }

  return (
    <ChallengeDetail
      challenge={challenge}
      backTo={from === 'browse' ? '/citizen/browse' : '/citizen/submissions'}
      backLabel={from === 'browse' ? 'Back to all challenges' : 'Back to my submissions'} />);


}