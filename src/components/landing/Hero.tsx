import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { ButtonLink } from '../ui/Button';

export function Hero() {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            India-wide collaborative problem solving
          </p>
          <h1 className="mt-5 font-serif text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[3.25rem] lg:text-[3.75rem]">
            The problems people live with, put in front of the people who can
            solve them.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Samadhan collects real societal challenges from people across India, uses live location and smart categorisation, and connects Admin-approved problems with university teams and industry partners.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink to="/signup" size="lg">
              Report a challenge
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/challenges" variant="secondary" size="lg">
              See what people are reporting
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            Free to use. Sign up as a citizen, university or industry partner. The platform Admin controls approvals.
          </p>
        </div>

        <figure className="relative">
          <img
            src="/db0fd39a-c0bb-4711-8319-f5179002ab18.jpg"
            alt="A village of tiled-roof houses on a red laterite road, with rural and urban communities in India."
            className="aspect-[4/3] w-full rounded-card border border-line object-cover shadow-raise" />
          
          <figcaption className="mt-4 max-w-md border-l-2 border-clay-300 pl-4 text-sm leading-relaxed text-ink-soft">
            One India-wide record. Real submissions. Real locations. Real teams. Samadhan is the collaboration layer between people who spot problems and people who can solve them.
          </figcaption>
        </figure>
      </div>
    </section>);

}