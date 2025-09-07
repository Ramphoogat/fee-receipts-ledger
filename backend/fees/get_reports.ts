import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { feesDB } from "./db";

export interface ReportsRequest {
  month?: Query<string>;
  class?: Query<string>;
  head_id?: Query<number>;
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

// Gets fee collection reports with aggregated data
export const getReports = api<ReportsRequest, FeeReportData>(
  { expose: true, method: "GET", path: "/reports/fees" },
  async (req) => {
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.month) {
      whereConditions.push(`i.month = $${paramIndex++}`);
      params.push(req.month);
    }

    if (req.class) {
      whereConditions.push(`i.class = $${paramIndex++}`);
      params.push(req.class);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get overall summary
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(i.billed_total), 0) as total_billed,
        COALESCE(SUM(i.paid_total), 0) as total_collected,
        COALESCE(SUM(i.balance), 0) as total_outstanding
      FROM invoices i
      ${whereClause}
    `;

    const summary = await feesDB.rawQueryRow<{
      total_billed: number;
      total_collected: number;
      total_outstanding: number;
    }>(summaryQuery, ...params);

    // Get by class breakdown
    const byClassQuery = `
      SELECT 
        i.class,
        COALESCE(SUM(i.billed_total), 0) as billed,
        COALESCE(SUM(i.paid_total), 0) as collected,
        COALESCE(SUM(i.balance), 0) as outstanding,
        COUNT(DISTINCT i.student_id) as student_count
      FROM invoices i
      ${whereClause}
      GROUP BY i.class
      ORDER BY i.class
    `;

    const byClass = await feesDB.rawQueryAll<{
      class: string;
      billed: number;
      collected: number;
      outstanding: number;
      student_count: number;
    }>(byClassQuery, ...params);

    let byHead: Array<{
      head_name: string;
      billed: number;
      collected: number;
      outstanding: number;
    }> | undefined;

    // Get by head breakdown if specific head requested or no filters applied
    if (!req.head_id) {
      const headWhereConditions = [...whereConditions];
      const headParams = [...params];
      let headParamIndex = paramIndex;

      if (req.head_id) {
        headWhereConditions.push(`ii.head_id = $${headParamIndex++}`);
        headParams.push(req.head_id);
      }

      const headWhereClause = headWhereConditions.length > 0 ? 
        `WHERE ${headWhereConditions.join(' AND ')}` : '';

      const byHeadQuery = `
        SELECT 
          ii.head_name,
          COALESCE(SUM(ii.amount), 0) as billed,
          COALESCE(SUM(
            CASE WHEN i.paid_total > 0 THEN 
              LEAST(ii.amount, (ii.amount / i.billed_total) * i.paid_total)
            ELSE 0 END
          ), 0) as collected,
          COALESCE(SUM(
            CASE WHEN i.balance > 0 THEN 
              LEAST(ii.amount, (ii.amount / i.billed_total) * i.balance)
            ELSE 0 END
          ), 0) as outstanding
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        ${headWhereClause}
        GROUP BY ii.head_name
        ORDER BY ii.head_name
      `;

      byHead = await feesDB.rawQueryAll<{
        head_name: string;
        billed: number;
        collected: number;
        outstanding: number;
      }>(byHeadQuery, ...headParams);
    }

    return {
      summary: summary || { total_billed: 0, total_collected: 0, total_outstanding: 0 },
      by_class: byClass,
      by_head: byHead,
    };
  }
);
