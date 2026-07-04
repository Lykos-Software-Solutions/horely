import Link from "next/link";
import { prisma } from "@/lib/db";
import { setAppointmentStatus } from "@/app/actions";
import {
  addDays,
  dateKey,
  isSameDay,
  longDateLabel,
  parseDateKey,
  startOfDay,
  timeLabel,
} from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminDayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const day = (date ? parseDateKey(date) : null) ?? startOfDay(new Date());
  const isToday = isSameDay(day, new Date());

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: day, lt: addDays(day, 1) } },
    include: { service: true, professional: true },
    orderBy: { startsAt: "asc" },
  });

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Agenda del día</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {longDateLabel(day)}
            {isToday ? " · hoy" : ""} · {appointments.length}{" "}
            {appointments.length === 1 ? "turno" : "turnos"}, {confirmedCount}{" "}
            {confirmedCount === 1 ? "confirmado" : "confirmados"}
          </p>
        </div>
        <nav className="flex items-center gap-1.5">
          <Link
            href={`/admin?date=${dateKey(addDays(day, -1))}`}
            aria-label="Día anterior"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-card transition hover:border-pine"
          >
            <ChevronLeftIcon className="size-4" />
          </Link>
          <Link
            href="/admin"
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              isToday
                ? "border-pine bg-pine text-paper"
                : "border-line bg-card hover:border-pine"
            }`}
          >
            Hoy
          </Link>
          <Link
            href={`/admin?date=${dateKey(addDays(day, 1))}`}
            aria-label="Día siguiente"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-card transition hover:border-pine"
          >
            <ChevronRightIcon className="size-4" />
          </Link>
        </nav>
      </header>

      {appointments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-card px-6 py-14 text-center text-ink-soft">
          No hay turnos para este día.
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className={`flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-card p-4 ${
                appt.status === "cancelled" ? "opacity-60" : ""
              }`}
            >
              <div className="tnum font-display w-14 text-lg font-bold">
                {timeLabel(appt.startsAt)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{appt.customerName}</p>
                <p className="truncate text-sm text-ink-soft">
                  {appt.service.name} · {appt.service.durationMin} min ·{" "}
                  {appt.professional.name}
                </p>
              </div>
              <StatusBadge status={appt.status} />
              {appt.status === "confirmed" ? (
                <div className="flex gap-2">
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="id" value={appt.id} />
                    <input type="hidden" name="status" value="completed" />
                    <button
                      type="submit"
                      className="rounded-lg bg-pine px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-pine-deep"
                    >
                      Completar
                    </button>
                  </form>
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="id" value={appt.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button
                      type="submit"
                      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-clay transition hover:border-clay"
                    >
                      Cancelar
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
