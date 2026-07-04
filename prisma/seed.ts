import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PRNG con semilla fija para que el seed sea reproducible
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260703);

const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

const CUSTOMERS = [
  "Mateo González",
  "Valentina López",
  "Santiago Fernández",
  "Martina Rodríguez",
  "Benjamín Díaz",
  "Lucía Martínez",
  "Joaquín Pérez",
  "Emilia Sánchez",
  "Tomás Romero",
  "Catalina Álvarez",
  "Franco Torres",
  "Julieta Ruiz",
  "Lautaro Acosta",
  "Milagros Benítez",
  "Bruno Medina",
  "Delfina Herrera",
  "Thiago Aguirre",
  "Renata Molina",
  "Facundo Castro",
  "Abril Ortiz",
];

function phone() {
  const n = () => Math.floor(rand() * 10);
  return `+54 9 11 ${n()}${n()}${n()}${n()}-${n()}${n()}${n()}${n()}`;
}

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.professional.deleteMany();

  const [nico, agus, cami] = await Promise.all([
    prisma.professional.create({
      data: { name: "Nicolás Ferreyra", role: "Barbero senior" },
    }),
    prisma.professional.create({
      data: { name: "Agustín Ríos", role: "Barbero" },
    }),
    prisma.professional.create({
      data: { name: "Camila Suárez", role: "Colorista y barbera" },
    }),
  ]);

  const [corte, corteBarba, color] = await Promise.all([
    prisma.service.create({
      data: {
        name: "Corte",
        description: "Corte clásico o degradé, terminado con navaja.",
        durationMin: 30,
        priceARS: 9500,
      },
    }),
    prisma.service.create({
      data: {
        name: "Corte + barba",
        description: "Corte completo más perfilado de barba con toalla caliente.",
        durationMin: 45,
        priceARS: 13500,
      },
    }),
    prisma.service.create({
      data: {
        name: "Color",
        description: "Color o mechas con productos profesionales.",
        durationMin: 60,
        priceARS: 18000,
      },
    }),
  ]);

  const professionals = [nico, agus, cami];
  const services = [corte, corteBarba, color];

  // Turnos desde el lunes de la semana pasada hasta el sábado de la próxima,
  // siempre relativos a hoy para que la agenda se vea poblada al correr el seed.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  const dow = (today.getDay() + 6) % 7; // 0 = lunes
  monday.setDate(today.getDate() - dow - 7);

  // Horarios pico deliberados: 11:00 y 18:00 concentran más turnos
  const hourPool = [10, 11, 11, 11, 12, 13, 14, 15, 16, 17, 18, 18, 18];

  const busy = new Map<string, Array<[number, number]>>();
  const appointments: Array<{
    startsAt: Date;
    status: string;
    customerName: string;
    customerPhone: string;
    serviceId: string;
    professionalId: string;
  }> = [];

  let created = 0;
  let guard = 0;
  while (created < 42 && guard < 2000) {
    guard++;
    const dayOffset = Math.floor(rand() * 19); // 19 días: lun pasada → sáb próxima
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayOffset);
    if (date.getDay() === 0) continue; // domingo cerrado

    const service = pick(services);
    const pro = pick(professionals);
    const hour = pick(hourPool);
    const minute = pick([0, 30]);
    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);
    const end = start.getTime() + service.durationMin * 60_000;
    if (end > new Date(date).setHours(19, 0, 0, 0)) continue;

    const key = `${pro.id}:${date.toDateString()}`;
    const slots = busy.get(key) ?? [];
    if (slots.some(([s, e]) => start.getTime() < e && end > s)) continue;
    slots.push([start.getTime(), end]);
    busy.set(key, slots);

    const isPast = start.getTime() < Date.now();
    const status = isPast
      ? rand() < 0.82
        ? "completed"
        : "cancelled"
      : rand() < 0.94
        ? "confirmed"
        : "cancelled";

    appointments.push({
      startsAt: start,
      status,
      customerName: pick(CUSTOMERS),
      customerPhone: phone(),
      serviceId: service.id,
      professionalId: pro.id,
    });
    created++;
  }

  await prisma.appointment.createMany({ data: appointments });

  console.log(
    `Seed listo: ${professionals.length} profesionales, ${services.length} servicios, ${appointments.length} turnos.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
