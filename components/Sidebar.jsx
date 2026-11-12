import { Link, NavLink } from 'react-router-dom';
import { History, Leaf, LogOut, Settings } from 'lucide-react';
import { NAV_ITEMS } from '@/components/nav/navItems';
import { cn } from '@/lib/utils';

export function SidebarBrand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="gradient-primary flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_14px_30px_-16px_rgba(112,214,154,0.85)]">
        <Leaf className="h-5 w-5 text-primary-foreground" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[17px] font-extrabold tracking-tight text-foreground">Plant Care</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Reminder</span>
      </span>
    </Link>
  );
}

export function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200',
              isActive
                ? 'bg-sidebar-accent text-primary ring-1 ring-primary/25'
                : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={cn('h-[18px] w-[18px] transition', isActive ? 'text-primary' : 'text-primary/60 group-hover:text-primary')}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function UserBlock({ user, displayName, initials, onSignOut }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-white/[0.03] px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary ring-1 ring-primary/30">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
        <p className="truncate text-[11px] text-muted-foreground">{user?.email || 'Signed in'}</p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-destructive"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Sidebar({ user, displayName, initials, onSignOut, bell }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
      <div className="flex items-center justify-between gap-2 px-1">
        <SidebarBrand />
        {bell}
      </div>

      <div className="mt-8 flex-1 overflow-y-auto pr-1">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">Menu</p>
        <NavList />
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-secondary/70 p-3.5">
        <p className="flex items-center gap-1.5 font-display text-xs font-bold text-primary">
          <Leaf className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          Consistency wins
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          A steady rhythm keeps houseplants thriving — check the soil before you water.
        </p>
      </div>

      <div className="mt-3">
        <UserBlock user={user} displayName={displayName} initials={initials} onSignOut={onSignOut} />
        <div className="mt-2 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          <Link to="/settings" className="inline-flex items-center gap-1.5 transition hover:text-primary">
            <Settings className="h-3 w-3" aria-hidden="true" /> Settings
          </Link>
          <Link to="/history" className="inline-flex items-center gap-1.5 transition hover:text-primary">
            <History className="h-3 w-3" aria-hidden="true" /> Journal
          </Link>
        </div>
      </div>
    </aside>
  );
}