import { useEffect, useState } from 'react';
import { BellRing, Check, Mail, MonitorSmartphone, Smartphone, TriangleAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SettingsCard from '@/components/settings/SettingsCard';
import ChannelRow from '@/components/settings/ChannelRow';
import ReminderTimeCard from '@/components/settings/ReminderTimeCard';
import ReminderSummary from '@/components/settings/ReminderSummary';
import useNotificationPrefs from '@/hooks/useNotificationPrefs';
import {
  notificationSupport,
  requestNotificationPermission,
  showBrowserNotification,
} from '@/lib/notifications';

const PERMISSION_COPY = {
  granted: 'Allowed in this browser',
  denied: 'Blocked in this browser. Re-enable notifications in your browser settings.',
  default: 'Not enabled yet',
  unsupported: 'Not supported in this browser',
};

export default function NotificationSettings() {
  const { toast } = useToast();
  const { prefs, user, ready, save } = useNotificationPrefs();
  const [permission, setPermission] = useState(notificationSupport());
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPermission(notificationSupport());
  }, []);

  async function update(next) {
    setError(null);
    setSaving(true);
    try {
      await save(next);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err?.message || 'Your settings could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleBrowser(value) {
    if (!value) {
      await update({ ...prefs, browser: false });
      return;
    }
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      await update({ ...prefs, browser: true });
      showBrowserNotification('Plant care reminders are on', {
        body: 'We will nudge you here when care is due while this app is open.',
      });
    } else {
      await update({ ...prefs, browser: false });
      toast({
        title: 'Notifications not enabled',
        description: 'Your browser did not grant permission. In-app reminders still work.',
        variant: 'destructive',
      });
    }
  }

  function saveReminderTime(value) {
    if (!value) return;
    update({ ...prefs, reminderTime: value });
  }

  const allOff = !prefs.inApp && !prefs.browser && !prefs.email;
  const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4 animate-in fade-in-50 duration-500">
      <PageHeader
        eyebrow="Preferences"
        title="Notification settings"
        description="Choose how and when you want to be reminded about plant care."
      />

      {!ready ? (
        <div className="card-surface flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          Loading your preferences
        </div>
      ) : (
        <>
          <ReminderSummary prefs={prefs} email={user?.email} />

          <SettingsCard
            icon={BellRing}
            title="Channels"
            description="Email is the only channel that reaches you while the app is closed."
          >
            <div className="space-y-2.5">
              <ChannelRow
                icon={BellRing}
                title="In-app reminders"
                description="A bell in the header counts care that is overdue or due today, once your reminder time has passed."
                checked={prefs.inApp}
                disabled={saving}
                onChange={(value) => update({ ...prefs, inApp: value })}
              />
              <ChannelRow
                icon={MonitorSmartphone}
                title="Browser notifications"
                description="Shown while this app is open in a tab."
                status={PERMISSION_COPY[permission]}
                checked={prefs.browser}
                disabled={saving || permission === 'unsupported'}
                onChange={toggleBrowser}
              />
              <ChannelRow
                icon={Mail}
                title="Email reminders"
                description={
                  user?.email
                    ? `Sent to ${user.email}, once a day when care is due.`
                    : 'Sent to your account email, once a day when care is due.'
                }
                checked={prefs.email}
                disabled={saving}
                onChange={(value) => update({ ...prefs, email: value })}
              />
            </div>
          </SettingsCard>

          <ReminderTimeCard
            value={prefs.reminderTime}
            timezone={timezone}
            emailOn={prefs.email}
            saving={saving}
            onSave={saveReminderTime}
          />

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              className="h-10 flex-1 rounded-full bg-card sm:flex-none"
              disabled={saving}
              onClick={() =>
                showBrowserNotification('Test plant care reminder', {
                  body: 'This is how a reminder will look on this device.',
                })
                  ? null
                  : toast({ title: 'Permission needed', description: 'Enable browser notifications first.' })
              }
            >
              Send test notification
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1 rounded-full bg-card sm:flex-none"
              disabled={saving || !ready || allOff}
              onClick={() => update({ ...prefs, inApp: false, browser: false, email: false })}
            >
              <TriangleAlert className="mr-2 h-4 w-4" aria-hidden="true" />
              Turn off all reminders
            </Button>
            {savedAt && !saving ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                <Check className="h-4 w-4" aria-hidden="true" />
                Saved
              </span>
            ) : null}
          </div>

          <SettingsCard icon={Smartphone} title="Good to know">
            <div className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">In-app and browser nudges</span> only run while this app
                is open in a tab. Nothing pops up on your device once the tab is closed.
              </p>
              <p>
                <span className="font-semibold text-foreground">Email reminders</span> are the one channel that works
                without the app open: a scheduled job checks every hour and sends at most one email per day, only on
                days when care is due.
              </p>
            </div>
          </SettingsCard>
        </>
      )}
    </div>
  );
}