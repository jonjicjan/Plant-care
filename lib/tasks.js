import { toDate } from '@/lib/plantCare';

export function buildTasks(schedules = [], plants = []) {
  const byId = new Map(plants.map((plant) => [plant.id, plant]));
  return schedules
    .filter((schedule) => schedule.active !== false && schedule.nextDueAt)
    .map((schedule) => {
      const plant = byId.get(schedule.plantId);
      return {
        ...schedule,
        plantName: plant?.plantName ?? 'Removed plant',
        plantImage: plant?.imageUrl ?? '',
        plantType: plant?.plantType ?? '',
      };
    })
    .sort((a, b) => (toDate(a.nextDueAt)?.getTime() ?? 0) - (toDate(b.nextDueAt)?.getTime() ?? 0));
}

export function nextCareForPlant(schedules, plantId) {
  const due = schedules
    .filter((schedule) => schedule.plantId === plantId && schedule.active !== false && schedule.nextDueAt)
    .sort((a, b) => (toDate(a.nextDueAt)?.getTime() ?? 0) - (toDate(b.nextDueAt)?.getTime() ?? 0));
  return due[0] ?? null;
}