/*
  Warnings:

  - A unique constraint covering the columns `[professionalId,startsAt]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Appointment_professionalId_startsAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_professionalId_startsAt_key" ON "Appointment"("professionalId", "startsAt");
