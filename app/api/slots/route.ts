import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/availability";
import { parseDateKey } from "@/lib/format";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const professionalId = params.get("professionalId");
  const serviceId = params.get("serviceId");
  const date = params.get("date");

  if (!professionalId || !serviceId || !date) {
    return NextResponse.json(
      { error: "Faltan parámetros: professionalId, serviceId y date." },
      { status: 400 }
    );
  }

  const day = parseDateKey(date);
  if (!day) {
    return NextResponse.json(
      { error: "La fecha tiene que tener formato YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
  }

  const slots = await getAvailableSlots(professionalId, service.durationMin, day);
  return NextResponse.json({ slots });
}
