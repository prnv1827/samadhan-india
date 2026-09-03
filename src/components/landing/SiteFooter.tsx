import React from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../ui/Button';

export function SiteFooter() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16 text-center lg:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Something in your area needs fixing. Put it on the record.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            A report takes about two minutes and enters the live Admin approval queue immediately.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/signup" size="lg">
              Create an account
            </ButtonLink>
            <ButtonLink to="/login" variant="secondary" size="lg">
              I already have one
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="bg-canvas">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-muted">
          <p>
            Samadhan India · Sole Platform Admin
          </p>
          <nav aria-label="Footer" className="flex gap-6">
            <Link to="/challenges" className="hover:text-forest-700">
              Challenges
            </Link>
            <Link to="/#how-it-works" className="hover:text-forest-700">
              How it works
            </Link>
            <Link to="/login" className="hover:text-forest-700">
              Log in
            </Link>
          </nav>
        </div>
      </footer>
    </>);

}