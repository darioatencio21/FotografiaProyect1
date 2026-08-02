-- === 005_invoices.sql ===
-- Add payment and contract columns to bookings table
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

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT DEFAULT '',
  "invoiceNumber" TEXT DEFAULT '',
  "clientName" TEXT DEFAULT '',
  "clientEmail" TEXT DEFAULT '',
  "packageName" TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal REAL DEFAULT 0,
  "depositPaid" REAL DEFAULT 0,
  total REAL DEFAULT 0,
  "amountPaid" REAL DEFAULT 0,
  "balanceDue" REAL DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  "paymentMethod" TEXT DEFAULT '',
  "stripePaymentIntentId" TEXT DEFAULT '',
  "stripeTxHash" TEXT DEFAULT '',
  "createdAt" TEXT DEFAULT '',
  "paidAt" TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Public read for authenticated users
CREATE POLICY "Auth read invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');

-- Allow public insert for booking/invoice creation
CREATE POLICY "Public insert invoices" ON invoices FOR INSERT WITH CHECK (true);

-- Authenticated users can update invoices
CREATE POLICY "Auth update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete invoices
CREATE POLICY "Auth delete invoices" ON invoices FOR DELETE USING (auth.role() = 'authenticated');



-- === 006_testimonial_moderation.sql ===
-- Client-submitted testimonials remain hidden until approved by the studio.
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT TRUE;



-- === 007_add_reminder.sql ===
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "reminderSentAt" TEXT DEFAULT '';



-- === 008_bookings_schema.sql ===
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



-- === 009_approval_flow.sql ===
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



