import { prisma } from "@/lib/db";
import { addDays, formatARS, startOfWeek } from "@/lib/format";
import { OPEN_HOUR, CLOSE_HOUR } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function AdminMetricsPage() {
  const monday = startOfWeek(new Date());
  const nextMonday = addDays(monday, 7);
  const prevMonday = addDays(monday, -7);

  const [week, prevWeekCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: monday, lt: nextMonday } },
      include: { service: true },
    }),
    prisma.appointment.count({
      where: {
        startsAt: { gte: prevMonday, lt: monday },
        status: { not: "cancelled" },
      },
    }),
  ]);

  const active = week.filter((a) => a.status !== "cancelled");
  const cancelledCount = week.length - active.length;
  const delta = active.length - prevWeekCount;

  const byService = new Map<string, { count: number; revenue: number }>();
  for (const appt of active) {
    const entry = byService.get(appt.service.name) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += appt.service.priceARS;
    byService.set(appt.service.name, entry);
  }
  const services = [...byService.entries()].sort((a, b) => b[1].count - a[1].count);
  const topService = services[0];
  const maxServiceCount = topService?.[1].count ?? 0;

  const hours = Array.from(
    { length: CLOSE_HOUR - OPEN_HOUR },
    (_, i) => OPEN_HOUR + i
  );
  const byHour = hours.map((hour) => ({
    hour,
    count: active.filter((a) => a.startsAt.getHours() === hour).length,
  }));
  const maxHourCount = Math.max(...byHour.map((h) => h.count), 1);

  const expectedRevenue = active.reduce((sum, a) => sum + a.service.priceARS, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold">Métricas</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Esta semana · lunes {monday.getDate()}/{monday.getMonth() + 1} al domingo{" "}
          {addDays(monday, 6).getDate()}/{addDays(monday, 6).getMonth() + 1}
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm text-ink-soft">Turnos de la semana</p>
          <p className="tnum font-display mt-1 text-4xl font-bold">
            {active.length}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {delta === 0
              ? "Igual que la semana pasada"
              : delta > 0
                ? `${delta} más que la semana pasada`
                : `${-delta} menos que la semana pasada`}
            {cancelledCount > 0
              ? ` · ${cancelledCount} ${cancelledCount === 1 ? "cancelado" : "cancelados"}`
              : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm text-ink-soft">Ingresos estimados</p>
          <p className="tnum font-display mt-1 text-4xl font-bold">
            {formatARS(expectedRevenue)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Sobre turnos confirmados y completados
          </p>
        </div>
      </div>

      <section className="mt-3 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm text-ink-soft">Servicio más pedido</h2>
        {topService ? (
          <>
            <p className="font-display mt-1 text-2xl font-bold">{topService[0]}</p>
            <ul className="mt-4 space-y-3">
              {services.map(([name, data]) => (
                <li key={name} className="text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{name}</span>
                    <span className="tnum text-ink-soft">
                      {data.count} {data.count === 1 ? "turno" : "turnos"} ·{" "}
                      {formatARS(data.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-sand">
                    <div
                      className={`h-2 rounded-full ${name === topService[0] ? "bg-honey" : "bg-pine"}`}
                      style={{
                        width: `${(data.count / maxServiceCount) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">
            Todavía no hay turnos esta semana.
          </p>
        )}
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm text-ink-soft">Horarios pico</h2>
        <p className="mt-1 text-sm text-ink-soft/80">
          Turnos por hora de inicio, esta semana
        </p>
        <div
          role="img"
          aria-label={`Turnos por hora: ${byHour
            .map((h) => `${h.hour} h, ${h.count}`)
            .join("; ")}`}
          className="mt-4"
        >
          <div className="flex h-36 items-end gap-1.5 border-b border-line">
            {byHour.map(({ hour, count }) => {
              const isPeak = count === maxHourCount && count > 0;
              return (
                <div
                  key={hour}
                  className="relative flex flex-1 flex-col items-center justify-end"
                >
                  {isPeak ? (
                    <span className="tnum mb-1 text-xs font-semibold text-honey-deep">
                      {count}
                    </span>
                  ) : null}
                  <div
                    title={`${hour} h: ${count} ${count === 1 ? "turno" : "turnos"}`}
                    className={`w-full max-w-8 rounded-t ${isPeak ? "bg-honey" : "bg-pine"}`}
                    style={{
                      height: `${(count / maxHourCount) * 112}px`,
                      minHeight: count > 0 ? "4px" : "0px",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {byHour.map(({ hour }) => (
              <span
                key={hour}
                className="tnum flex-1 text-center text-[11px] text-ink-soft"
              >
                {hour}
              </span>
            ))}
          </div>
          <p className="mt-1 text-right text-[11px] text-ink-soft/70">
            hora de inicio
          </p>
        </div>
      </section>
    </div>
  );
}
