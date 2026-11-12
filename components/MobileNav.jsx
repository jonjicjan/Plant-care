import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Plus, X } from 'lucide-react';
import { SidebarBrand, NavList, UserBlock } from '@/components/Sidebar';
import { MOBILE_TABS } from '@/components/nav/navItems';
import { cn } from '@/lib/utils';

export default function MobileNav({ user, displayName, initials, onSignOut, bell }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <SidebarBrand />
          <div className="flex items-center gap-1.5">
            {bell}
            <Link
              to="/plants/new"
              className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-[0_10px_24px_-14px_rgba(112,214,154,0.9)]"
              aria-label="Add plant"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl border border-border/70 bg-card p-2 text-muted-foreground transition hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div
          className={cn('absolute inset-0 bg-black/70 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
          onClick={close}
        />
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col border-l border-sidebar-border bg-sidebar px-4 py-5 shadow-2xl transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between">
            <SidebarBrand />
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-muted-foreground transition hover:text-foreground"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flex-1 overflow-y-auto">
            <NavList onNavigate={close} />
          </div>
          <UserBlock user={user} displayName={displayName} initials={initials} onSignOut={onSignOut} />
        </div>
      </div>

      <nav
        className="safe-bottom fixed bottom-0 left-0 right-0 z-20 flex items-stretch justify-around border-t border-border/70 bg-sidebar/95 pt-1 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        {MOBILE_TABS.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            {short || label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}