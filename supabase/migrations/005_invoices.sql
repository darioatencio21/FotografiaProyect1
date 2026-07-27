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
DROP POLICY IF EXISTS "Auth read invoices" ON invoices;
CREATE POLICY "Auth read invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');

-- Allow public insert for booking/invoice creation
DROP POLICY IF EXISTS "Public insert invoices" ON invoices;
CREATE POLICY "Public insert invoices" ON invoices FOR INSERT WITH CHECK (true);

-- Authenticated users can update invoices
DROP POLICY IF EXISTS "Auth update invoices" ON invoices;
CREATE POLICY "Auth update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete invoices
DROP POLICY IF EXISTS "Auth delete invoices" ON invoices;
CREATE POLICY "Auth delete invoices" ON invoices FOR DELETE USING (auth.role() = 'authenticated');
