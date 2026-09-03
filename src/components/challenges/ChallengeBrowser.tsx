import React, { useMemo, useState } from 'react';
import { FilterXIcon, SearchIcon } from 'lucide-react';
import { ChallengeCard } from '../ChallengeCard';
import { Input, Select } from '../ui/Field';
import { Button } from '../ui/Button';
import { domains, statusMeta, statusOrder, states } from '../../data/taxonomy';
import type { Challenge, ChallengeStatus } from '../../types';

export function ChallengeBrowser({
  challenges,
  linkBase



}: {challenges: Challenge[];linkBase: string;}) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('all');
  const [district, setDistrict] = useState('all');
  const [domain, setDomain] = useState('all');
  const [status, setStatus] = useState<'all' | ChallengeStatus>('all');

  const filtered = useMemo(
    () =>
    challenges.filter((challenge) => {
      const haystack = `${challenge.title} ${challenge.description} ${challenge.city}`.toLowerCase();
      return (
        (query.trim() === '' || haystack.includes(query.toLowerCase())) && (
        district === 'all' || challenge.district === district) && (
        domain === 'all' || challenge.domain === domain) && (
        status === 'all' || challenge.status === status));

    }),
    [challenges, query, district, domain, status]
  );

  const isFiltered =
  query !== '' || state !== 'all' || district !== 'all' || domain !== 'all' || status !== 'all';

  const reset = () => {
    setQuery('');
    setState('all');
    setDistrict('');
    setDomain('all');
    setStatus('all');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface p-4">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true" />
          
          <Input
            aria-label="Search challenges"
            placeholder="Search by keyword, village or town"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)} />
          
        </div>
        <Select aria-label="Filter by state" className="w-auto min-w-[160px]" value={state} onChange={(event)=>setState(event.target.value)}>
          <option value="all">All states / UTs</option>{states.map((item)=><option key={item}>{item}</option>)}
        </Select>
        <Input aria-label="Filter by district" className="w-auto min-w-[150px]" placeholder="District" value={district==='all'?'':district} onChange={(event)=>setDistrict(event.target.value||'all')} />
        <Select
          aria-label="Filter by domain"
          className="w-auto min-w-[170px]"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}>
          
          <option value="all">All domains</option>
          {domains.map((item) =>
          <option key={item} value={item}>
              {item}
            </option>
          )}
        </Select>
        <Select
          aria-label="Filter by status"
          className="w-auto min-w-[150px]"
          value={status}
          onChange={(event) => setStatus(event.target.value as 'all' | ChallengeStatus)}>
          
          <option value="all">Any status</option>
          {statusOrder.map((item) =>
          <option key={item} value={item}>
              {statusMeta[item].label}
            </option>
          )}
        </Select>
        {isFiltered &&
        <Button variant="ghost" size="sm" onClick={reset}>
            <FilterXIcon className="h-4 w-4" aria-hidden="true" />
            Clear
          </Button>
        }
      </div>

      <p className="mt-5 text-sm text-ink-muted" aria-live="polite">
        Showing {filtered.length} of {challenges.length} challenges
      </p>

      {filtered.length === 0 ?
      <div className="mt-6 rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
          <h3 className="font-serif text-xl font-semibold text-ink">
            Nothing matches those filters
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            No one has reported this yet in the area you picked. If you are seeing
            the problem, you can be the first to put it on record.
          </p>
          <Button variant="secondary" size="sm" className="mt-6" onClick={reset}>
            Clear filters
          </Button>
        </div> :

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((challenge) =>
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          to={`${linkBase}/${challenge.id}`} />

        )}
        </div>
      }
    </div>);

}