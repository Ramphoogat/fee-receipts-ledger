import { api, APIError } from "encore.dev/api";
import { feesDB } from "./db";

export interface GenerateInvoicesRequest {
  class: string;
  month: string; // YYYY-MM format
  heads?: Array<{ head_id: number; amount?: number }>;
  strategy?: 'DEFAULT_HEADS' | 'CUSTOM_PER_CLASS';
}

export interface GenerateInvoicesResponse {
  created: number;
  updated: number;
}

// Generates invoices for all students in a class for a specific month
export const generateInvoices = api<GenerateInvoicesRequest, GenerateInvoicesResponse>(
  { expose: true, method: "POST", path: "/invoices/generate" },
  async (req) => {
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(req.month)) {
      throw APIError.invalidArgument("Month must be in YYYY-MM format");
    }

    if (!req.class) {
      throw APIError.invalidArgument("Class is required");
    }

    let created = 0;
    let updated = 0;

    await feesDB.exec`BEGIN`;

    try {
      // Get all students in the class
      const students = await feesDB.queryAll<{ id: number; name: string }>`
        SELECT id, name FROM students WHERE class = ${req.class}
      `;

      if (students.length === 0) {
        throw APIError.notFound(`No students found in class ${req.class}`);
      }

      // Get fee heads to use
      let feeHeads: Array<{ head_id: number; amount: number; head_name: string }>;
      
      if (req.heads && req.heads.length > 0) {
        // Validate provided heads exist
        const headIds = req.heads.map(h => h.head_id);
        const existingHeads = await feesDB.queryAll<{ id: number; name: string; amount_default: number }>`
          SELECT id, name, amount_default FROM fee_heads WHERE id = ANY(${headIds}) AND active = true
        `;

        if (existingHeads.length !== headIds.length) {
          throw APIError.invalidArgument("One or more fee heads not found or inactive");
        }

        feeHeads = req.heads.map(h => {
          const head = existingHeads.find(eh => eh.id === h.head_id)!;
          return {
            head_id: h.head_id,
            amount: h.amount ?? head.amount_default,
            head_name: head.name
          };
        });
      } else {
        // Use default active heads
        const activeHeads = await feesDB.queryAll<{ id: number; name: string; amount_default: number }>`
          SELECT id, name, amount_default FROM fee_heads WHERE active = true ORDER BY name
        `;

        feeHeads = activeHeads.map(h => ({
          head_id: h.id,
          amount: h.amount_default,
          head_name: h.name
        }));
      }

      const billedTotal = feeHeads.reduce((sum, h) => sum + h.amount, 0);

      // Process each student
      for (const student of students) {
        // Check if invoice already exists
        const existingInvoice = await feesDB.queryRow<{ id: number; billed_total: number; paid_total: number }>`
          SELECT id, billed_total, paid_total FROM invoices 
          WHERE student_id = ${student.id} AND month = ${req.month}
        `;

        if (existingInvoice) {
          // Update existing invoice
          const newBalance = billedTotal - existingInvoice.paid_total;
          let status = 'UNPAID';
          if (existingInvoice.paid_total > 0 && existingInvoice.paid_total < billedTotal) {
            status = 'PARTIAL';
          } else if (existingInvoice.paid_total >= billedTotal) {
            status = 'PAID';
          }

          await feesDB.exec`
            UPDATE invoices 
            SET billed_total = ${billedTotal}, balance = ${newBalance}, status = ${status}
            WHERE id = ${existingInvoice.id}
          `;

          // Delete existing items and recreate
          await feesDB.exec`DELETE FROM invoice_items WHERE invoice_id = ${existingInvoice.id}`;
          
          for (const head of feeHeads) {
            await feesDB.exec`
              INSERT INTO invoice_items (invoice_id, head_id, head_name, amount)
              VALUES (${existingInvoice.id}, ${head.head_id}, ${head.head_name}, ${head.amount})
            `;
          }

          updated++;
        } else {
          // Create new invoice
          const invoiceResult = await feesDB.queryRow<{ id: number }>`
            INSERT INTO invoices (student_id, class, month, billed_total, paid_total, balance, status)
            VALUES (${student.id}, ${req.class}, ${req.month}, ${billedTotal}, 0, ${billedTotal}, 'UNPAID')
            RETURNING id
          `;

          const invoiceId = invoiceResult!.id;

          // Create invoice items
          for (const head of feeHeads) {
            await feesDB.exec`
              INSERT INTO invoice_items (invoice_id, head_id, head_name, amount)
              VALUES (${invoiceId}, ${head.head_id}, ${head.head_name}, ${head.amount})
            `;
          }

          created++;
        }
      }

      await feesDB.exec`COMMIT`;

      return { created, updated };
    } catch (error) {
      await feesDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
