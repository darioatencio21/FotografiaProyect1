-- Add approval flow columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "approvalToken" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "approvedAt" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "approvalExpiresAt" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contractStatus" TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "paymentTxHash" TEXT DEFAULT '';

-- Add approvalExpirationHours to bookingconfig
ALTER TABLE bookingconfig ADD COLUMN IF NOT EXISTS "approvalExpirationHours" INTEGER DEFAULT 48;
