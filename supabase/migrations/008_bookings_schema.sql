-- Ensure all fields currently used by the booking workflow exist.
-- Safe to run more than once and useful when earlier migrations were skipped.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "isPaid" BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "depositAmount" REAL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "amountDue" REAL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "travelExpenses" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractData" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractAccepted" BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractSignature" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractSignedAt" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractPhotographerSignature" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractPhotographerSignedAt" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "packageName" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "packageDetails" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractType" TEXT DEFAULT 'session';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "invoiceId" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "reminderSentAt" TEXT DEFAULT '';
