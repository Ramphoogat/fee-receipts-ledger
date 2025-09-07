export interface Invoice {
  id: number;
  student_id: number;
  student_name: string;
  student_roll: string;
  class: string;
  month: string;
  billed_total: number;
  paid_total: number;
  balance: number;
  status: string;
  created_at: string;
}

export interface ListInvoicesResponse {
  items: Invoice[];
  total: number;
  billed_sum: number;
  paid_sum: number;
  balance_sum: number;
}

export interface GenerateInvoicesRequest {
  class: string;
  month: string;
  heads?: Array<{ head_id: number; amount?: number }>;
  strategy?: 'DEFAULT_HEADS' | 'CUSTOM_PER_CLASS';
}

export interface GenerateInvoicesResponse {
  created: number;
  updated: number;
}

export interface CreatePaymentRequest {
  invoice_id: number;
  amount: number;
  mode: 'CASH' | 'CARD' | 'UPI' | 'BANK' | 'OTHER';
  txn_ref?: string;
  paid_on?: string;
  idempotency_key?: string;
}

export interface PaymentResponse {
  id: number;
  receipt_no: string;
  invoice: {
    id: number;
    status: string;
    balance: number;
    paid_total: number;
  };
}

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

export interface FeeReportData {
  summary: {
    total_billed: number;
    total_collected: number;
    total_outstanding: number;
  };
  by_class: Array<{
    class: string;
    billed: number;
    collected: number;
    outstanding: number;
    student_count: number;
  }>;
  by_head?: Array<{
    head_name: string;
    billed: number;
    collected: number;
    outstanding: number;
  }>;
}
