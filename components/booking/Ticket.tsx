"use client";

import { formatARS, longDateLabel, timeLabel } from "@/lib/format";
import { CheckIcon } from "@/components/icons";

export type ConfirmedAppointment = {
  id: string;
  startsAtISO: string;
  serviceName: string;
  durationMin: number;
  priceARS: number;
  professionalName: string;
  customerName: string;
};

export function Ticket({
  appointment,
  onReset,
}: {
  appointment: ConfirmedAppointment;
  onReset: () => void;
}) {
  const startsAt = new Date(appointment.startsAtISO);
  const code = appointment.id.slice(-6).toUpperCase();

  return (
    <section className="mt-8 animate-rise-slow" aria-live="polite">
      <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_20px_50px_-30px_rgba(34,26,20,0.35)]">
        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-pine-mist text-pine">
            <CheckIcon className="size-7" />
          </span>
          <h2 className="font-display mt-4 text-3xl font-bold">
            ¡Listo, {appointment.customerName.split(" ")[0]}!
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tu turno quedó confirmado en Barbería Norte.
          </p>
        </div>

        <div className="ticket-notch border-t border-dashed border-line px-6 pb-6 pt-5">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Servicio</dt>
              <dd className="font-medium">{appointment.serviceName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Profesional</dt>
              <dd className="font-medium">{appointment.professionalName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Fecha</dt>
              <dd className="font-medium">{longDateLabel(startsAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Hora</dt>
              <dd className="tnum font-medium">
                {timeLabel(startsAt)} h · {appointment.durationMin} min
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Precio</dt>
              <dd className="tnum font-semibold text-honey-deep">
                {formatARS(appointment.priceARS)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-2.5">
              <dt className="text-ink-soft">Código de reserva</dt>
              <dd className="font-display tnum font-bold tracking-[0.15em]">
                {code}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-pine px-6 py-4 text-center text-sm text-paper/90">
          Te esperamos en Av. Cabildo 2451. Si no llegás, avisanos con tiempo.
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 w-full rounded-xl border border-line bg-card py-3.5 font-semibold transition hover:border-pine"
      >
        Reservar otro turno
      </button>
    </section>
  );
}
