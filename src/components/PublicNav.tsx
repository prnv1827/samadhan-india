import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { ButtonLink } from './ui/Button';

const links = [
{ label: 'How it works', href: '/#how-it-works' },
{ label: 'Browse challenges', href: '/challenges' },
{ label: 'For universities', href: '/#partners' },
{ label: 'For industry', href: '/#partners' }];


export function PublicNav() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-8 px-6">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
          {links.map((link) =>
          <Link
            key={link.label}
            to={link.href}
            className="rounded-card px-3 py-2 text-sm font-medium text-ink-soft transition-colors duration-150 ease-soft hover:bg-forest-50 hover:text-forest-700">
            
              {link.label}
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ButtonLink to="/login" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink
            to="/signup"
            size="sm"
            className={pathname === '/signup' ? 'pointer-events-none opacity-60' : ''}>
            
            Create account
          </ButtonLink>
        </div>
      </div>
    </header>);

}