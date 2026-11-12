import { useEffect, useState } from 'react';
import { Check, Clock3, Save } from 'lucide-react';
import SettingsCard from '@/components/settings/SettingsCard';
import { Button } from '@/components/ui/button';
import { formatTime12, nextReminderAt, relativeDayLabel } from '@/lib/reminderTiming';

export default function ReminderTimeCard({ value, timezone, emailOn, saving, onSave }) {
  const [draft, setDraft] = useState(value || '09:00');

  useEffect(() => {
    setDraft(value || '09:00');
  }, [value]);

  const dirty = draft !== value;
  const next = nextReminderAt(value);

  return (
    <SettingsCard
      icon={Clock3}
      title="Reminder time"
      description="One time for every channel: the in-app bell, browser notifications and your daily email."
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-white/[0.03] p-3.5">
        <input
          type="time"
          value={draft}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          className="field-shell h-11 w-[7.75rem] text-center text-base font-semibold"
          aria-label="Reminder time"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-primary">{formatTime12(draft || value)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Your timezone: {timezone}</p>
        </div>
        {dirty ? (
          <Button size="sm" className="h-9 rounded-full px-4" disabled={saving} onClick={() => onSave(draft)}>
            <Save className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {saving ? 'Saving…' : 'Save time'}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {emailOn
          ? `Next email reminder: ${relativeDayLabel(next)} at ${formatTime12(value)}.`
          : 'Email reminders are off, so this time only affects the in-app and browser nudges.'}
      </p>
    </SettingsCard>
  );
}