import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ReminderBell from '@/components/ReminderBell';

export default function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then((account) => setUser(account))
      .catch(() => setUser(null));
  }, []);

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Your account';
  const initials = (user?.full_name || user?.email || 'You').trim().slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await base44.auth.logout('/login');
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
      <Sidebar
        user={user}
        displayName={displayName}
        initials={initials}
        onSignOut={handleSignOut}
        bell={<ReminderBell />}
      />

      <MobileNav
        user={user}
        displayName={displayName}
        initials={initials}
        onSignOut={handleSignOut}
        bell={<ReminderBell />}
      />

      <main className="min-w-0 lg:pl-[268px]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-9">
          <Outlet />
        </div>
      </main>
    </div>
  );
}