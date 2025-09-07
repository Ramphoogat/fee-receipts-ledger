import { api, APIError } from "encore.dev/api";
import { feesDB } from "./db";

export interface ReceiptData {
  payment_id: number;
  receipt_no: string;
  amount: number;
  mode: string;
  txn_ref?: string;
  paid_on: string;
  student: {
    id: number;
    name: string;
    roll_no: string;
    class: string;
  };
  invoice: {
    id: number;
    month: string;
    billed_total: number;
    paid_total: number;
    balance: number;
  };
  items: Array<{
    head_name: string;
    amount: number;
  }>;
}

// Gets printable receipt data for a payment
export const getReceipt = api<{ payment_id: number }, ReceiptData>(
  { expose: true, method: "GET", path: "/receipt/:payment_id" },
  async ({ payment_id }) => {
    const receipt = await feesDB.queryRow<{
      payment_id: number;
      receipt_no: string;
      amount: number;
      mode: string;
      txn_ref?: string;
      paid_on: Date;
      student_id: number;
      student_name: string;
      student_roll: string;
      student_class: string;
      invoice_id: number;
      invoice_month: string;
      billed_total: number;
      paid_total: number;
      balance: number;
    }>`
      SELECT 
        p.id as payment_id,
        p.receipt_no,
        p.amount,
        p.mode,
        p.txn_ref,
        p.paid_on,
        s.id as student_id,
        s.name as student_name,
        s.roll_no as student_roll,
        s.class as student_class,
        i.id as invoice_id,
        i.month as invoice_month,
        i.billed_total,
        i.paid_total,
        i.balance
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN students s ON i.student_id = s.id
      WHERE p.id = ${payment_id}
    `;

    if (!receipt) {
      throw APIError.notFound("Receipt not found");
    }

    // Get invoice items
    const items = await feesDB.queryAll<{
      head_name: string;
      amount: number;
    }>`
      SELECT head_name, amount
      FROM invoice_items
      WHERE invoice_id = ${receipt.invoice_id}
      ORDER BY head_name
    `;

    return {
      payment_id: receipt.payment_id,
      receipt_no: receipt.receipt_no,
      amount: receipt.amount,
      mode: receipt.mode,
      txn_ref: receipt.txn_ref,
      paid_on: receipt.paid_on.toISOString(),
      student: {
        id: receipt.student_id,
        name: receipt.student_name,
        roll_no: receipt.student_roll,
        class: receipt.student_class,
      },
      invoice: {
        id: receipt.invoice_id,
        month: receipt.invoice_month,
        billed_total: receipt.billed_total,
        paid_total: receipt.paid_total,
        balance: receipt.balance,
      },
      items,
    };
  }
);
