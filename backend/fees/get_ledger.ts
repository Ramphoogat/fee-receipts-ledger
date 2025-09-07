import { api, APIError } from "encore.dev/api";
import { feesDB } from "./db";

export interface LedgerEntry {
  type: 'INVOICE' | 'PAYMENT';
  date: string;
  description: string;
  amount: number;
  balance: number;
  reference?: string;
  invoice_id?: number;
  payment_id?: number;
}

export interface LedgerResponse {
  student: {
    id: number;
    name: string;
    roll_no: string;
    class: string;
  };
  entries: LedgerEntry[];
  opening_balance: number;
  closing_balance: number;
}

// Gets student ledger with transaction history
export const getLedger = api<{ student_id: number }, LedgerResponse>(
  { expose: true, method: "GET", path: "/ledger/:student_id" },
  async ({ student_id }) => {
    // Get student info
    const student = await feesDB.queryRow<{
      id: number;
      name: string;
      roll_no: string;
      class: string;
    }>`
      SELECT id, name, roll_no, class
      FROM students
      WHERE id = ${student_id}
    `;

    if (!student) {
      throw APIError.notFound("Student not found");
    }

    // Get all invoices and payments
    const transactions = await feesDB.queryAll<{
      type: string;
      date: Date;
      description: string;
      amount: number;
      reference?: string;
      invoice_id?: number;
      payment_id?: number;
    }>`
      SELECT 
        'INVOICE' as type,
        i.created_at as date,
        'Invoice for ' || i.month as description,
        i.billed_total as amount,
        'INV-' || i.id as reference,
        i.id as invoice_id,
        null as payment_id
      FROM invoices i
      WHERE i.student_id = ${student_id}
      
      UNION ALL
      
      SELECT 
        'PAYMENT' as type,
        p.paid_on as date,
        'Payment - ' || p.mode || CASE WHEN p.txn_ref IS NOT NULL THEN ' (' || p.txn_ref || ')' ELSE '' END as description,
        -p.amount as amount,
        p.receipt_no as reference,
        p.invoice_id,
        p.id as payment_id
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.student_id = ${student_id}
      
      ORDER BY date ASC, type DESC
    `;

    // Calculate running balance
    let runningBalance = 0;
    const entries: LedgerEntry[] = transactions.map(txn => {
      runningBalance += txn.amount;
      return {
        type: txn.type as 'INVOICE' | 'PAYMENT',
        date: txn.date.toISOString(),
        description: txn.description,
        amount: txn.amount,
        balance: runningBalance,
        reference: txn.reference,
        invoice_id: txn.invoice_id,
        payment_id: txn.payment_id,
      };
    });

    return {
      student,
      entries,
      opening_balance: 0,
      closing_balance: runningBalance,
    };
  }
);
