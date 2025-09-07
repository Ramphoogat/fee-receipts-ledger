import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReceiptData } from '../types/api';
import { formatDate } from '../utils/formatting';
import { useCurrency } from '../utils/currency';

interface ReceiptPrintProps {
  receipt: ReceiptData;
  onPrint?: () => void;
}

export default function ReceiptPrint({ receipt, onPrint }: ReceiptPrintProps) {
  const { formatCurrency } = useCurrency();

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  return (
    <div>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint} className="flex items-center space-x-2">
          <Printer className="h-4 w-4" />
          <span>Print Receipt</span>
        </Button>
      </div>

      <div className="bg-white p-8 receipt-print">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">XYZ School</h1>
          <p className="text-gray-600">123 Education Street, City 123456</p>
          <p className="text-gray-600">Phone: (555) 123-4567</p>
        </div>

        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <h2 className="text-xl font-semibold text-center">PAYMENT RECEIPT</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Student Details</h3>
            <p><strong>Name:</strong> {receipt.student.name}</p>
            <p><strong>Roll No:</strong> {receipt.student.roll_no}</p>
            <p><strong>Class:</strong> {receipt.student.class}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Receipt Details</h3>
            <p><strong>Receipt No:</strong> {receipt.receipt_no}</p>
            <p><strong>Date:</strong> {formatDate(receipt.paid_on)}</p>
            <p><strong>Month:</strong> {receipt.invoice.month}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Fee Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Fee Head</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.head_name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
            <p><strong>Mode:</strong> {receipt.mode}</p>
            {receipt.txn_ref && (
              <p><strong>Reference:</strong> {receipt.txn_ref}</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Amount Details</h3>
            <p><strong>Total Billed:</strong> {formatCurrency(receipt.invoice.billed_total)}</p>
            <p><strong>Amount Paid:</strong> {formatCurrency(receipt.amount)}</p>
            <p><strong>Balance:</strong> {formatCurrency(receipt.invoice.balance)}</p>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4">
          <p className="text-center text-sm text-gray-600">
            Thank you for your payment. Keep this receipt for your records.
          </p>
        </div>
      </div>
    </div>
  );
}
