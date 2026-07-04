"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createBooking } from "@/app/actions";
import {
  addDays,
  dateKey,
  DAYS_SHORT,
  formatARS,
  isSameDay,
  longDateLabel,
  parseDateKey,
  startOfDay,
  timeLabel,
} from "@/lib/format";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@/components/icons";
import { Ticket, type ConfirmedAppointment } from "./Ticket";

export type ServiceDTO = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceARS: number;
};

export type ProfessionalDTO = {
  id: string;
  name: string;
  role: string;
};

type Step = "service" | "professional" | "schedule" | "details";

const STEP_ORDER: Step[] = ["service", "professional", "schedule", "details"];

const STEP_TITLES: Record<Step, string> = {
  service: "¿Qué te vas a hacer?",
  professional: "¿Con quién te atendés?",
  schedule: "Elegí día y horario",
  details: "Tus datos",
};

const AVATAR_STYLES = [
  "bg-pine-mist text-pine",
  "bg-honey-soft text-honey-deep",
  "bg-clay-soft text-clay",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function BookingFlow({
  services,
  professionals,
}: {
  services: ServiceDTO[];
  professionals: ProfessionalDTO[];
}) {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<ServiceDTO | null>(null);
  const [professional, setProfessional] = useState<ProfessionalDTO | null>(null);
  const [dayKey, setDayKey] = useState<string>(() => {
    // Primer día abierto desde hoy (domingo cerrado)
    let day = startOfDay(new Date());
    if (day.getDay() === 0) day = addDays(day, 1);
    return dateKey(day);
  });
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotISO, setSlotISO] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  useEffect(() => {
    if (step !== "schedule" || !service || !professional) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      professionalId: professional.id,
      serviceId: service.id,
      date: dayKey,
    });
    fetch(`/api/slots?${params}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setSlots(Array.isArray(data.slots) ? data.slots : []))
      .catch((err) => {
        if (err.name !== "AbortError") setSlots([]);
      });
    return () => controller.abort();
  }, [step, service, professional, dayKey]);

  function goBack() {
    setError(null);
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) setStep(STEP_ORDER[index - 1]);
  }

  function reset() {
    setStep("service");
    setService(null);
    setProfessional(null);
    setSlotISO(null);
    setSlots(null);
    setConfirmed(null);
    setError(null);
  }

  function submitBooking(formData: FormData) {
    if (!service || !professional || !slotISO) return;
    const customerName = String(formData.get("name") ?? "");
    const customerPhone = String(formData.get("phone") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        serviceId: service.id,
        professionalId: professional.id,
        startsAtISO: slotISO,
        customerName,
        customerPhone,
      });
      if (result.ok) {
        setConfirmed(result.appointment);
      } else {
        setError(result.error);
        if (result.error.includes("ocupar")) {
          setSlots(null);
          setSlotISO(null);
          setStep("schedule");
        }
      }
    });
  }

  if (confirmed) {
    return <Ticket appointment={confirmed} onReset={reset} />;
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const selectedDay = parseDateKey(dayKey) ?? startOfDay(new Date());
  const slotDate = slotISO ? new Date(slotISO) : null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            aria-label="Volver al paso anterior"
            className="flex size-9 items-center justify-center rounded-full border border-line bg-card text-ink-soft transition hover:text-ink"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        ) : null}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Paso {stepIndex + 1} de 4
          </p>
          <h2 className="font-display text-2xl font-bold">{STEP_TITLES[step]}</h2>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5" aria-hidden>
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-pine" : "bg-sand"
            }`}
          />
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-clay-soft px-4 py-3 text-sm text-clay">
          {error}
        </p>
      ) : null}

      {step === "service" ? (
        <ul className="mt-5 flex animate-rise flex-col gap-3">
          {services.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  setService(s);
                  setStep("professional");
                }}
                className="group flex w-full items-start justify-between gap-4 rounded-2xl border border-line bg-card p-5 text-left transition hover:border-pine active:scale-[0.99]"
              >
                <span>
                  <span className="font-display block text-lg font-semibold">
                    {s.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">
                    {s.description}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink-soft">
                    <ClockIcon className="size-3.5" />
                    {s.durationMin} min
                  </span>
                </span>
                <span className="tnum shrink-0 pt-0.5 font-semibold text-honey-deep">
                  {formatARS(s.priceARS)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {step === "professional" ? (
        <ul className="mt-5 flex animate-rise flex-col gap-3">
          {professionals.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setProfessional(p);
                  setSlots(null);
                  setSlotISO(null);
                  setStep("schedule");
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-line bg-card p-4 text-left transition hover:border-pine active:scale-[0.99]"
              >
                <span
                  className={`font-display flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${AVATAR_STYLES[i % AVATAR_STYLES.length]}`}
                >
                  {initials(p.name)}
                </span>
                <span className="flex-1">
                  <span className="font-display block font-semibold">{p.name}</span>
                  <span className="block text-sm text-ink-soft">{p.role}</span>
                </span>
                <ChevronRightIcon className="size-5 text-ink-soft" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {step === "schedule" ? (
        <div className="mt-5 animate-rise">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            <div className="flex w-max gap-2">
              {days.map((day) => {
                const key = dateKey(day);
                const isSelected = key === dayKey;
                const closed = day.getDay() === 0;
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={closed}
                    onClick={() => {
                      setSlots(null);
                      setSlotISO(null);
                      setDayKey(key);
                    }}
                    className={`flex w-14 flex-col items-center rounded-2xl border py-2.5 transition ${
                      isSelected
                        ? "border-pine bg-pine text-paper"
                        : closed
                          ? "cursor-not-allowed border-transparent text-ink-soft/40"
                          : "border-line bg-card hover:border-pine"
                    }`}
                  >
                    <span className="text-[11px] font-medium uppercase">
                      {DAYS_SHORT[day.getDay()]}
                    </span>
                    <span className="tnum font-display text-lg font-bold">
                      {day.getDate()}
                    </span>
                    <span
                      className={`text-[10px] ${isSelected ? "text-paper/80" : "text-ink-soft"}`}
                    >
                      {isToday ? "hoy" : closed ? "cerrado" : " "}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-sm text-ink-soft">
            Horarios para el {longDateLabel(selectedDay).toLowerCase()}
          </p>

          {slots === null ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-sand" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-line bg-card px-4 py-8 text-center text-sm text-ink-soft">
              No quedan horarios libres para este día.
              <br />
              Probá con otro día u otro profesional.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {slots.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setSlotISO(iso);
                    setStep("details");
                  }}
                  className="tnum h-11 rounded-xl border border-line bg-card text-sm font-medium transition hover:border-pine hover:bg-pine-mist active:scale-[0.97]"
                >
                  {timeLabel(new Date(iso))}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === "details" && service && professional && slotDate ? (
        <form action={submitBooking} className="mt-5 animate-rise">
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Tu turno
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Servicio</dt>
                <dd className="font-medium">{service.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Profesional</dt>
                <dd className="font-medium">{professional.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Fecha</dt>
                <dd className="font-medium">{longDateLabel(slotDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Hora</dt>
                <dd className="tnum font-medium">
                  {timeLabel(slotDate)} h · {service.durationMin} min
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2">
                <dt className="text-ink-soft">Total</dt>
                <dd className="tnum font-semibold text-honey-deep">
                  {formatARS(service.priceARS)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Nombre y apellido
              </span>
              <input
                name="name"
                required
                autoComplete="name"
                placeholder="Ej.: Juana Molina"
                className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base placeholder:text-ink-soft/50"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Teléfono</span>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="Ej.: 11 5555-4444"
                className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base placeholder:text-ink-soft/50"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-xl bg-pine py-3.5 font-semibold text-paper transition hover:bg-pine-deep active:scale-[0.99] disabled:opacity-60"
          >
            {pending ? "Confirmando…" : "Confirmar turno"}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Sin señas ni pagos online: abonás en el local.
          </p>
        </form>
      ) : null}

      {service && step !== "details" ? (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">
                {service.name}
                {professional ? ` · ${professional.name}` : ""}
              </p>
              <p className="truncate text-xs text-ink-soft">
                {slotDate
                  ? `${longDateLabel(slotDate)} · ${timeLabel(slotDate)} h`
                  : step === "schedule"
                    ? "Elegí un horario para continuar"
                    : "Elegí profesional y horario"}
              </p>
            </div>
            <p className="tnum shrink-0 font-semibold text-honey-deep">
              {formatARS(service.priceARS)}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
