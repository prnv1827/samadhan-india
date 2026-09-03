import React from 'react';
import { howItWorks } from '../../data/platform';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            How a report becomes a solution
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Four stages, each with a named owner. Nothing sits in an inbox
            without a next step.
          </p>
        </div>

        <ol className="mt-12 grid gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {howItWorks.map((item, index) =>
          <li key={item.step} className="relative flex gap-5 lg:block">
              <div className="flex flex-col items-center lg:block">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest-200 bg-forest-50 font-serif text-base font-semibold text-forest-700">
                  {index + 1}
                </span>
                <span
                aria-hidden="true"
                className="mt-2 w-px flex-1 bg-line lg:hidden" />
              
              </div>
              <div
              aria-hidden="true"
              className="absolute left-9 right-0 top-[1.0625rem] hidden h-px bg-line lg:block" />
            
              <div className="pb-2 lg:mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-500">
                  {item.step}
                </p>
                <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                  {item.body}
                </p>
              </div>
            </li>
          )}
        </ol>
      </div>
    </section>);

}