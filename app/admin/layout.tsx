import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Horely · Panel",
  description: "Panel de administración de Barbería Norte.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh md:flex">
      <aside className="flex flex-col gap-4 bg-ink px-5 py-5 text-paper md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:gap-8 md:py-8">
        <div className="flex items-baseline justify-between md:block">
          <Link href="/admin" className="font-display text-2xl font-bold">
            H<span className="text-honey">o</span>rely
          </Link>
          <p className="text-xs text-paper/60 md:mt-1">Panel · Barbería Norte</p>
        </div>
        <AdminNav />
        <div className="hidden flex-1 md:block" />
        <Link
          href="/"
          className="hidden text-sm text-paper/60 underline-offset-2 hover:text-paper hover:underline md:block"
        >
          Ver página pública →
        </Link>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-8 md:py-8">{children}</main>
    </div>
  );
}
