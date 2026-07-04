import Link from "next/link";
import { prisma } from "@/lib/db";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { ClockIcon, MapPinIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, professionals] = await Promise.all([
    prisma.service.findMany({ orderBy: { priceARS: "asc" } }),
    prisma.professional.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <p className="font-display text-2xl font-bold tracking-tight">
          H<span className="text-honey">o</span>rely
        </p>
        <p className="text-sm text-ink-soft">turnos online</p>
      </header>

      <main className="flex-1 pb-36">
        <section className="animate-rise-slow overflow-hidden rounded-3xl bg-pine text-paper">
          <div className="px-6 pb-6 pt-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/70">
              Barbería
            </p>
            <h1 className="font-display mt-1 text-4xl font-bold leading-tight sm:text-5xl">
              Barbería Norte
            </h1>
            <div className="mt-4 flex flex-col gap-1.5 text-sm text-paper/85">
              <p className="flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0" />
                Av. Cabildo 2451, Belgrano
              </p>
              <p className="flex items-center gap-2">
                <ClockIcon className="size-4 shrink-0" />
                Lunes a sábado · 10 a 19 h
              </p>
            </div>
          </div>
          <div className="border-t border-paper/15 bg-pine-deep/60 px-6 py-3 text-sm text-paper/80 sm:px-8">
            Reservá tu turno en menos de un minuto.
          </div>
        </section>

        <BookingFlow
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            durationMin: s.durationMin,
            priceARS: s.priceARS,
          }))}
          professionals={professionals.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role,
          }))}
        />
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-soft">
        Demo de <span className="font-display font-semibold">Horely</span> · turnos
        online para tu negocio ·{" "}
        <Link href="/admin" className="underline underline-offset-2 hover:text-ink">
          panel de administración
        </Link>
      </footer>
    </div>
  );
}
