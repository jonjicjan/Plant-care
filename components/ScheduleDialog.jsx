import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { CARE_TYPES, toDate } from '@/lib/plantCare';

const emptyForm = {
  plantId: '',
  careType: 'watering',
  dueDate: format(new Date(), 'yyyy-MM-dd'),
  intervalDays: '',
  reminderTime: '09:00',
  reminderEnabled: true,
  active: true,
};

export default function ScheduleDialog({ open, onOpenChange, plants = [], schedule = null, defaultPlantId = '', onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(schedule?.id);

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      const due = toDate(schedule.nextDueAt);
      setForm({
        plantId: schedule.plantId || '',
        careType: schedule.careType || 'watering',
        dueDate: due ? format(due, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        intervalDays: String(schedule.intervalDays ?? ''),
        reminderTime: schedule.reminderTime || '09:00',
        reminderEnabled: schedule.reminderEnabled !== false,
        active: schedule.active !== false,
      });
    } else {
      setForm({ ...emptyForm, plantId: defaultPlantId || plants[0]?.id || '' });
    }
    setErrors({});
    setFormError('');
  }, [open, schedule, defaultPlantId, plants]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  function validate() {
    const next = {};
    if (!form.plantId) next.plantId = 'Choose the plant this care belongs to.';
    if (!form.careType) next.careType = 'Choose a care activity.';
    if (!form.dueDate) next.dueDate = 'Pick the first due date.';
    const interval = Number(form.intervalDays);
    if (!form.intervalDays || Number.isNaN(interval) || interval < 1 || interval > 365) {
      next.intervalDays = 'Use a whole number of days between 1 and 365.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setFormError('');
    try {
      const me = await base44.auth.me();
      const payload = {
        userId: me.id,
        plantId: form.plantId,
        careType: form.careType,
        intervalDays: Number(form.intervalDays),
        nextDueAt: new Date(`${form.dueDate}T${form.reminderTime || '09:00'}:00`).toISOString(),
        reminderTime: form.reminderTime || '09:00',
        reminderEnabled: form.reminderEnabled,
        active: form.active,
      };
      if (isEdit) await base44.entities.CareSchedule.update(schedule.id, payload);
      else await base44.entities.CareSchedule.create(payload);
      await onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setFormError(err?.message || 'We could not save this schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? 'Edit care schedule' : 'New care schedule'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose the rhythm — we will keep the next due date moving for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="schedule-plant" className="mb-1.5 block text-sm font-medium">
              Plant
            </label>
            <select
              id="schedule-plant"
              className="field-shell"
              value={form.plantId}
              onChange={(event) => setField('plantId', event.target.value)}
              aria-invalid={Boolean(errors.plantId)}
            >
              <option value="">Select a plant</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.plantName}
                </option>
              ))}
            </select>
            {errors.plantId ? <p className="mt-1 text-xs text-destructive">{errors.plantId}</p> : null}
          </div>

          <div>
            <label htmlFor="schedule-type" className="mb-1.5 block text-sm font-medium">
              Care activity
            </label>
            <select
              id="schedule-type"
              className="field-shell"
              value={form.careType}
              onChange={(event) => setField('careType', event.target.value)}
            >
              {CARE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {CARE_TYPES.find((type) => type.value === form.careType)?.hint}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="schedule-due" className="mb-1.5 block text-sm font-medium">
                First due date
              </label>
              <input
                id="schedule-due"
                type="date"
                className="field-shell"
                value={form.dueDate}
                onChange={(event) => setField('dueDate', event.target.value)}
                aria-invalid={Boolean(errors.dueDate)}
              />
              {errors.dueDate ? <p className="mt-1 text-xs text-destructive">{errors.dueDate}</p> : null}
            </div>
            <div>
              <label htmlFor="schedule-interval" className="mb-1.5 block text-sm font-medium">
                Repeat every (days)
              </label>
              <input
                id="schedule-interval"
                type="number"
                min="1"
                max="365"
                inputMode="numeric"
                placeholder="Set for this plant"
                className="field-shell"
                value={form.intervalDays}
                onChange={(event) => setField('intervalDays', event.target.value)}
                aria-invalid={Boolean(errors.intervalDays)}
              />
              {errors.intervalDays ? (
                <p className="mt-1 text-xs text-destructive">{errors.intervalDays}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  {CARE_TYPES.find((type) => type.value === form.careType)?.intervalHint}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="schedule-time" className="mb-1.5 block text-sm font-medium">
                Reminder time
              </label>
              <input
                id="schedule-time"
                type="time"
                className="field-shell"
                value={form.reminderTime}
                onChange={(event) => setField('reminderTime', event.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-white/[0.03] px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium">Reminders</p>
                <p className="text-xs text-muted-foreground">Show this task when due</p>
              </div>
              <Switch
                checked={form.reminderEnabled}
                onCheckedChange={(value) => setField('reminderEnabled', value)}
                aria-label="Enable reminders for this schedule"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-white/[0.03] px-3.5 py-2.5">
            <div>
              <p className="text-sm font-medium">Schedule active</p>
              <p className="text-xs text-muted-foreground">Pause it any time without losing history</p>
            </div>
            <Switch
              checked={form.active}
              onCheckedChange={(value) => setField('active', value)}
              aria-label="Schedule active"
            />
          </div>

          {formError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <DialogFooter className="mt-2 flex-row justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}