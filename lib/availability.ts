import { prisma } from "./db";
import { addDays, startOfDay } from "./format";

export const OPEN_HOUR = 10;
export const CLOSE_HOUR = 19;
export const SLOT_STEP_MIN = 30;

export function isOpenDay(date: Date): boolean {
  return date.getDay() !== 0; // domingo cerrado
}

/**
 * Horarios libres de un profesional para un día, como fechas ISO.
 * Un horario está libre si el turno entra completo dentro del horario de
 * atención y no se superpone con otro turno vigente del profesional.
 */
export async function getAvailableSlots(
  professionalId: string,
  durationMin: number,
  day: Date
): Promise<string[]> {
  const dayStart = startOfDay(day);
  if (!isOpenDay(dayStart)) return [];

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId,
      status: { not: "cancelled" },
      startsAt: { gte: dayStart, lt: addDays(dayStart, 1) },
    },
    include: { service: { select: { durationMin: true } } },
  });

  const busy = appointments.map((a) => ({
    start: a.startsAt.getTime(),
    end: a.startsAt.getTime() + a.service.durationMin * 60_000,
  }));

  const close = new Date(dayStart);
  close.setHours(CLOSE_HOUR, 0, 0, 0);

  const slots: string[] = [];
  const cursor = new Date(dayStart);
  cursor.setHours(OPEN_HOUR, 0, 0, 0);

  while (cursor.getTime() + durationMin * 60_000 <= close.getTime()) {
    const start = cursor.getTime();
    const end = start + durationMin * 60_000;
    const overlaps = busy.some((b) => start < b.end && end > b.start);
    const inPast = start <= Date.now();
    if (!overlaps && !inPast) slots.push(new Date(start).toISOString());
    cursor.setMinutes(cursor.getMinutes() + SLOT_STEP_MIN);
  }

  return slots;
}
