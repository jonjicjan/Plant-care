import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { CARE_TYPES } from '@/lib/plantCare';

export default function CareOverview({ completed = [], tasks = [] }) {
  const rows = useMemo(() => {
    return CARE_TYPES.map((type) => {
      const done = Number(completed.find((row) => (row.careType ?? row._id) === type.value)?.count ?? 0);
      const pending = tasks.filter((task) => task.careType === type.value).length;
      return { ...type, done, pending };
    });
  }, [completed, tasks]);

  const totalDone = rows.reduce((sum, row) => sum + row.done, 0);
  const totalPending = rows.reduce((sum, row) => sum + row.pending, 0);
  const total = totalDone + totalPending;
  const rate = total > 0 ? Math.round((totalDone / total) * 100) : 0;
  const chartData = [
    { name: 'Completed', value: totalDone || 0, fill: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: totalPending || 0, fill: 'hsl(var(--chart-2))' },
  ];

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-[104px] w-[104px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={total > 0 ? chartData : [{ name: 'No data', value: 1, fill: 'hsl(var(--border))' }]}
                dataKey="value"
                innerRadius={36}
                outerRadius={50}
                paddingAngle={total > 0 ? 3 : 0}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {(total > 0 ? chartData : [{ name: 'No data', value: 1, fill: 'hsl(var(--border))' }]).map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-extrabold leading-none">{rate}%</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">done</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-chart-1" aria-hidden="true" />
              Completed
            </span>
            <span className="font-semibold text-foreground">{totalDone}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-chart-2" aria-hidden="true" />
              Pending
            </span>
            <span className="font-semibold text-foreground">{totalPending}</span>
          </div>
          <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
            {total === 0 ? 'Complete a care task to start your overview.' : `${total} care ${total === 1 ? 'task' : 'tasks'} tracked so far.`}
          </p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {rows.map((row) => {
          const rowTotal = row.done + row.pending;
          const width = rowTotal > 0 ? Math.round((row.done / rowTotal) * 100) : 0;
          return (
            <li key={row.value}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-muted-foreground">{row.label}</span>
                <span className="shrink-0 text-muted-foreground/80">
                  {row.done} done · {row.pending} due
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="gradient-primary h-full rounded-full transition-all duration-500" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}