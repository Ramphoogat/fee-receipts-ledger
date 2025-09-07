-- Fee heads master table
CREATE TABLE fee_heads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  amount_default NUMERIC(12,2) NOT NULL CHECK (amount_default >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Students table (basic structure for the module)
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class TEXT NOT NULL,
  month TEXT NOT NULL, -- format YYYY-MM
  billed_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('UNPAID','PARTIAL','PAID','VOID')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(student_id, month)
);

-- Invoice items for transparency
CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  head_id INT NOT NULL REFERENCES fee_heads(id),
  head_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0)
);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  mode TEXT NOT NULL CHECK (mode IN ('CASH','CARD','UPI','BANK','OTHER')),
  txn_ref TEXT,
  paid_on TIMESTAMP NOT NULL DEFAULT now(),
  receipt_no TEXT NOT NULL UNIQUE,
  meta JSONB
);

-- Idempotency table
CREATE TABLE idempotency (
  key TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Receipt sequence table for generating unique receipt numbers
CREATE TABLE receipts_sequence (
  year_month TEXT PRIMARY KEY,
  next_number INT NOT NULL DEFAULT 1
);

-- Indices for performance
CREATE INDEX idx_invoices_class_month ON invoices(class, month);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Insert some sample data for testing
INSERT INTO fee_heads (name, amount_default) VALUES 
('Tuition Fee', 5000.00),
('Lab Fee', 1000.00),
('Transport Fee', 2000.00),
('Library Fee', 500.00);

INSERT INTO students (name, roll_no, class) VALUES 
('John Doe', 'STD001', '10-A'),
('Jane Smith', 'STD002', '10-A'),
('Bob Johnson', 'STD003', '10-B'),
('Alice Brown', 'STD004', '10-B');
