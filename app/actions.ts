"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/availability";

export type BookingInput = {
  serviceId: string;
  professionalId: string;
  startsAtISO: string;
  customerName: string;
  customerPhone: string;
};

export type BookingResult =
  | {
      ok: true;
      appointment: {
        id: string;
        startsAtISO: string;
        serviceName: string;
        durationMin: number;
        priceARS: number;
        professionalName: string;
        customerName: string;
      };
    }
  | { ok: false; error: string };

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  if (!customerName || !customerPhone) {
    return { ok: false, error: "Completá tu nombre y teléfono para confirmar." };
  }

  const startsAt = new Date(input.startsAtISO);
  if (isNaN(startsAt.getTime())) {
    return { ok: false, error: "El horario elegido no es válido." };
  }

  const [service, professional] = await Promise.all([
    prisma.service.findUnique({ where: { id: input.serviceId } }),
    prisma.professional.findUnique({ where: { id: input.professionalId } }),
  ]);
  if (!service || !professional) {
    return { ok: false, error: "El servicio o profesional ya no está disponible." };
  }

  // Revalidamos el horario contra la agenda para evitar reservas duplicadas
  const slots = await getAvailableSlots(professional.id, service.durationMin, startsAt);
  if (!slots.includes(startsAt.toISOString())) {
    return {
      ok: false,
      error: "Ese horario se acaba de ocupar. Elegí otro, por favor.",
    };
  }

  const appointment = await prisma.appointment.create({
    data: {
      startsAt,
      customerName,
      customerPhone,
      serviceId: service.id,
      professionalId: professional.id,
    },
  });

  revalidatePath("/admin");

  return {
    ok: true,
    appointment: {
      id: appointment.id,
      startsAtISO: appointment.startsAt.toISOString(),
      serviceName: service.name,
      durationMin: service.durationMin,
      priceARS: service.priceARS,
      professionalName: professional.name,
      customerName,
    },
  };
}

export async function setAppointmentStatus(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") return;
  if (!["confirmed", "completed", "cancelled"].includes(status)) return;

  await prisma.appointment.update({ where: { id }, data: { status } });

  revalidatePath("/admin");
  revalidatePath("/admin/semana");
  revalidatePath("/admin/metricas");
}
