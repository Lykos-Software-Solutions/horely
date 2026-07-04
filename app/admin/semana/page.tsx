import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  addDays,
  dateKey,
  DAYS_SHORT,
  isSameDay,
  startOfWeek,
  timeLabel,
} from "@/lib/format";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const DOT: Record<string, string> = {
  confirmed: "bg-pine",
  completed: "bg-ink-soft/50",
  cancelled: "bg-clay",
};

export default async function AdminWeekPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const offset = Number.parseInt(semana ?? "0", 10) || 0;
  const monday = addDays(startOfWeek(new Date()), offset * 7);
  const days = Array.from({ length: 6 }, (_, i) => addDays(monday, i)); // lun–sáb

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: monday, lt: addDays(monday, 7) } },
    include: { service: true, professional: true },
    orderBy: { startsAt: "asc" },
  });

  const weekLabel =
    offset === 0
      ? "Esta semana"
      : offset === 1
        ? "Semana próxima"
        : offset === -1
          ? "Semana pasada"
          : `Semana del ${monday.getDate()}/${monday.getMonth() + 1}`;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Semana</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {weekLabel} · {monday.getDate()}/{monday.getMonth() + 1} al{" "}
            {addDays(monday, 5).getDate()}/{addDays(monday, 5).getMonth() + 1} ·{" "}
            {appointments.length} turnos
          </p>
        </div>
        <nav className="flex items-center gap-1.5">
          <Link
            href={`/admin/semana?semana=${offset - 1}`}
            aria-label="Semana anterior"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-card transition hover:border-pine"
          >
            <ChevronLeftIcon className="size-4" />
          </Link>
          <Link
            href="/admin/semana"
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              offset === 0
                ? "border-pine bg-pine text-paper"
                : "border-line bg-card hover:border-pine"
            }`}
          >
            Esta semana
          </Link>
          <Link
            href={`/admin/semana?semana=${offset + 1}`}
            aria-label="Semana siguiente"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-card transition hover:border-pine"
          >
            <ChevronRightIcon className="size-4" />
          </Link>
        </nav>
      </header>

      <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
        <div className="grid w-max min-w-full grid-cols-6 gap-3">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const dayAppointments = appointments.filter((a) =>
              isSameDay(a.startsAt, day)
            );
            return (
              <div key={dateKey(day)} className="w-44 min-w-44">
                <Link
                  href={`/admin?date=${dateKey(day)}`}
                  className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isToday
                      ? "bg-pine text-paper"
                      : "bg-sand text-ink hover:bg-line"
                  }`}
                >
                  {DAYS_SHORT[day.getDay()]} {day.getDate()}
                  <span
                    className={`ml-2 font-normal ${isToday ? "text-paper/75" : "text-ink-soft"}`}
                  >
                    {dayAppointments.length || "—"}
                  </span>
                </Link>
                <div className="mt-2 flex flex-col gap-2">
                  {dayAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className={`rounded-xl border border-line bg-card p-2.5 text-xs ${
                        appt.status === "cancelled" ? "opacity-55" : ""
                      }`}
                    >
                      <p className="tnum flex items-center gap-1.5 font-semibold">
                        <span
                          className={`size-1.5 rounded-full ${DOT[appt.status] ?? DOT.confirmed}`}
                        />
                        {timeLabel(appt.startsAt)} · {appt.service.name}
                      </p>
                      <p className="mt-0.5 truncate text-ink-soft">
                        {appt.customerName}
                      </p>
                      <p className="truncate text-ink-soft/80">
                        {appt.professional.name.split(" ")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
