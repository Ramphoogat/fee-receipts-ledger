-- Drop indices first
DROP INDEX IF EXISTS idx_invoice_items_invoice;
DROP INDEX IF EXISTS idx_payments_invoice;
DROP INDEX IF EXISTS idx_invoices_student;
DROP INDEX IF EXISTS idx_invoices_class_month;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS receipts_sequence;
DROP TABLE IF EXISTS idempotency;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS fee_heads;
