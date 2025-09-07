import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { feesDB } from "./db";

export interface ListInvoicesRequest {
  class?: Query<string>;
  month?: Query<string>;
  status?: Query<string>;
  q?: Query<string>; // search query for student name/roll
  limit?: Query<number>;
  offset?: Query<number>;
}

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

// Lists invoices with filters and pagination
export const listInvoices = api<ListInvoicesRequest, ListInvoicesResponse>(
  { expose: true, method: "GET", path: "/invoices" },
  async (req) => {
    const limit = req.limit ?? 50;
    const offset = req.offset ?? 0;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.class) {
      whereConditions.push(`i.class = $${paramIndex++}`);
      params.push(req.class);
    }

    if (req.month) {
      whereConditions.push(`i.month = $${paramIndex++}`);
      params.push(req.month);
    }

    if (req.status) {
      whereConditions.push(`i.status = $${paramIndex++}`);
      params.push(req.status);
    }

    if (req.q) {
      whereConditions.push(`(s.name ILIKE $${paramIndex} OR s.roll_no ILIKE $${paramIndex})`);
      params.push(`%${req.q}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count and sums
    const summaryQuery = `
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(i.billed_total)::DOUBLE PRECISION, 0) as billed_sum,
        COALESCE(SUM(i.paid_total)::DOUBLE PRECISION, 0) as paid_sum,
        COALESCE(SUM(i.balance)::DOUBLE PRECISION, 0) as balance_sum
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      ${whereClause}
    `;

    const summary = await feesDB.rawQueryRow<{
      total: number;
      billed_sum: number;
      paid_sum: number;
      balance_sum: number;
    }>(summaryQuery, ...params);

    // Get paginated items
    const itemsQuery = `
      SELECT 
        i.id,
        i.student_id,
        s.name as student_name,
        s.roll_no as student_roll,
        i.class,
        i.month,
        i.billed_total::DOUBLE PRECISION as billed_total,
        i.paid_total::DOUBLE PRECISION as paid_total,
        i.balance::DOUBLE PRECISION as balance,
        i.status,
        i.created_at
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      ${whereClause}
      ORDER BY i.created_at DESC, s.name
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    params.push(limit, offset);

    const items = await feesDB.rawQueryAll<Invoice>(itemsQuery, ...params);

    return {
      items,
      total: summary?.total ?? 0,
      billed_sum: summary?.billed_sum ?? 0,
      paid_sum: summary?.paid_sum ?? 0,
      balance_sum: summary?.balance_sum ?? 0,
    };
  }
);
