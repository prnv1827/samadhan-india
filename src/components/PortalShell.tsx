import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { roleMeta } from '../data/taxonomy';
import type { Role } from '../types';
import { cn } from '../utils/cn';

const portalNav: Record<Role, Array<{label: string;to: string;}>> = {
  citizen: [
  { label: 'Submit a challenge', to: '/citizen/submit' },
  { label: 'My submissions', to: '/citizen/submissions' },
  { label: 'Browse challenges', to: '/citizen/browse' }],

  university: [{ label: 'Routed to us', to: '/university' }],
  industry: [{ label: 'Opportunities', to: '/industry' }],
  admin: [{ label: 'Admin approvals', to: '/admin' }]
};

export function PortalShell({
  children,
  showBrowseFeed = true



}: {children: React.ReactNode;showBrowseFeed?: boolean;}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = portalNav[user.role].filter(
    (item) => showBrowseFeed || item.to !== '/citizen/browse'
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-6 px-6">
          <Logo to={roleMeta[user.role].home} />
          <span className="hidden rounded-full border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-soft sm:inline">
            {roleMeta[user.role].label}
          </span>
          <nav aria-label="Portal" className="hidden items-center gap-1 md:flex">
            {items.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
              cn(
                'rounded-card px-3 py-2 text-sm font-medium transition-colors duration-150 ease-soft',
                isActive ?
                'bg-forest-700 text-white' :
                'text-ink-soft hover:bg-forest-50 hover:text-forest-700'
              )
              }>
              
                {item.label}
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <span className="block text-sm font-semibold text-ink">{user.name}</span>
              <span className="block text-xs text-ink-muted">
                {user.organization ?? user.district ?? user.email}
              </span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 bg-forest-50 text-sm font-semibold text-forest-700">
              {user.name.charAt(0)}
            </span>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate('/');
              }}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-card border border-line bg-surface text-ink-muted transition-colors duration-150 ease-soft hover:border-clay-200 hover:text-clay-500">
              
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav
          aria-label="Portal sections"
          className="flex gap-1 overflow-x-auto border-t border-line px-6 pb-2 pt-2 md:hidden">
          
          {items.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
            cn(
              'whitespace-nowrap rounded-card px-3 py-1.5 text-sm font-medium',
              isActive ? 'bg-forest-700 text-white' : 'text-ink-soft'
            )
            }>
            
              {item.label}
            </NavLink>
          )}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">{children}</main>
      <footer className="border-t border-line px-6 py-5">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <span>
            Samadhan India · Sole Platform Admin
          </span>
          <Link to="/" className="font-medium hover:text-forest-700">
            Public site
          </Link>
        </div>
      </footer>
    </div>);

}