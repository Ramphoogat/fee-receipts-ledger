import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, User, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import backend from '~backend/client';
import { formatCurrency, formatDate } from '../utils/formatting';

export default function LedgerPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: ledger, isLoading } = useQuery({
    queryKey: ['ledger', studentId],
    queryFn: () => backend.fees.getLedger({ student_id: parseInt(studentId!) }),
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Student not found</h2>
          <Button className="mt-4" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Balance', 'Reference'],
      ...ledger.entries.map(entry => [
        formatDate(entry.date),
        entry.type,
        entry.description,
        entry.amount.toString(),
        entry.balance.toString(),
        entry.reference || ''
      ])
    ];

    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ledger-${ledger.student.roll_no}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Student Ledger</h1>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-sm font-semibold">{ledger.student.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Roll Number</label>
              <p className="text-sm font-semibold">{ledger.student.roll_no}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Class</label>
              <p className="text-sm font-semibold">{ledger.student.class}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Current Balance</label>
              <p className={`text-sm font-semibold ${ledger.closing_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(ledger.closing_balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {ledger.entries.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">No invoices or payments recorded for this student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ledger.entries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {entry.type === 'INVOICE' ? (
                        <Receipt className="h-5 w-5 text-blue-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{entry.description}</p>
                        <Badge variant={entry.type === 'INVOICE' ? 'default' : 'secondary'}>
                          {entry.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(entry.date)}
                        {entry.reference && (
                          <span className="ml-2">• {entry.reference}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${entry.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {entry.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(entry.amount))}
                    </p>
                    <p className="text-sm text-gray-600">
                      Balance: {formatCurrency(entry.balance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
