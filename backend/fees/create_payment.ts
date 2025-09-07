import { api, APIError } from "encore.dev/api";
import { feesDB } from "./db";

export interface CreatePaymentRequest {
  invoice_id: number;
  amount: number;
  mode: 'CASH' | 'CARD' | 'UPI' | 'BANK' | 'OTHER';
  txn_ref?: string;
  paid_on?: string; // ISO string
  idempotency_key?: string;
}

export interface Payment {
  id: number;
  receipt_no: string;
  invoice: {
    id: number;
    status: string;
    balance: number;
    paid_total: number;
  };
}

// Creates a payment for an invoice
export const createPayment = api<CreatePaymentRequest, Payment>(
  { expose: true, method: "POST", path: "/payments" },
  async (req) => {
    // Validation
    if (req.amount <= 0) {
      throw APIError.invalidArgument("Amount must be greater than 0");
    }

    if (req.mode !== 'CASH' && !req.txn_ref) {
      throw APIError.invalidArgument("Transaction reference is required for non-cash payments");
    }

    const paidOn = req.paid_on ? new Date(req.paid_on) : new Date();
    if (isNaN(paidOn.getTime())) {
      throw APIError.invalidArgument("Invalid paid_on date");
    }

    await feesDB.exec`BEGIN`;

    try {
      // Check idempotency
      if (req.idempotency_key) {
        const existing = await feesDB.queryRow<{ key: string }>`
          SELECT key FROM idempotency WHERE key = ${req.idempotency_key}
        `;
        if (existing) {
          throw APIError.alreadyExists("Payment with this idempotency key already exists");
        }
      }

      // Check for duplicate txn_ref
      if (req.txn_ref) {
        const existingTxn = await feesDB.queryRow<{ id: number }>`
          SELECT id FROM payments WHERE txn_ref = ${req.txn_ref}
        `;
        if (existingTxn) {
          throw APIError.alreadyExists("Payment with this transaction reference already exists");
        }
      }

      // Lock and get invoice
      const invoice = await feesDB.queryRow<{
        id: number;
        student_id: number;
        balance: number;
        paid_total: number;
        billed_total: number;
        status: string;
      }>`
        SELECT id, student_id, balance, paid_total, billed_total, status
        FROM invoices 
        WHERE id = ${req.invoice_id}
        FOR UPDATE
      `;

      if (!invoice) {
        throw APIError.notFound("Invoice not found");
      }

      if (invoice.status === 'VOID') {
        throw APIError.failedPrecondition("Cannot make payment to void invoice");
      }

      // Round amount to 2 decimal places (half-up)
      const roundedAmount = Math.round(req.amount * 100) / 100;

      if (roundedAmount > invoice.balance) {
        throw APIError.invalidArgument(`Payment amount ${roundedAmount} exceeds balance ${invoice.balance}`);
      }

      // Generate receipt number
      const yearMonth = paidOn.toISOString().substring(0, 7); // YYYY-MM
      
      // Upsert sequence
      await feesDB.exec`
        INSERT INTO receipts_sequence (year_month, next_number)
        VALUES (${yearMonth}, 2)
        ON CONFLICT (year_month) 
        DO UPDATE SET next_number = receipts_sequence.next_number + 1
      `;

      const sequence = await feesDB.queryRow<{ next_number: number }>`
        SELECT next_number FROM receipts_sequence WHERE year_month = ${yearMonth}
      `;

      const receiptNo = `REC-${yearMonth}-${String(sequence!.next_number - 1).padStart(6, '0')}`;

      // Insert payment
      const paymentResult = await feesDB.queryRow<{ id: number }>`
        INSERT INTO payments (invoice_id, amount, mode, txn_ref, paid_on, receipt_no, meta)
        VALUES (${req.invoice_id}, ${roundedAmount}, ${req.mode}, ${req.txn_ref || null}, ${paidOn}, ${receiptNo}, ${JSON.stringify({})})
        RETURNING id
      `;

      const paymentId = paymentResult!.id;

      // Update invoice totals and status
      const newPaidTotal = invoice.paid_total + roundedAmount;
      const newBalance = invoice.billed_total - newPaidTotal;
      
      let newStatus = 'UNPAID';
      if (newPaidTotal > 0 && newPaidTotal < invoice.billed_total) {
        newStatus = 'PARTIAL';
      } else if (newPaidTotal >= invoice.billed_total) {
        newStatus = 'PAID';
      }

      await feesDB.exec`
        UPDATE invoices 
        SET paid_total = ${newPaidTotal}, balance = ${newBalance}, status = ${newStatus}
        WHERE id = ${req.invoice_id}
      `;

      // Insert idempotency record
      if (req.idempotency_key) {
        await feesDB.exec`
          INSERT INTO idempotency (key) VALUES (${req.idempotency_key})
        `;
      }

      await feesDB.exec`COMMIT`;

      return {
        id: paymentId,
        receipt_no: receiptNo,
        invoice: {
          id: invoice.id,
          status: newStatus,
          balance: newBalance,
          paid_total: newPaidTotal,
        },
      };
    } catch (error) {
      await feesDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
