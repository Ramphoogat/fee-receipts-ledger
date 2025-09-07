import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import ReceiptPrint from '../components/ReceiptPrint';
import backend from '~backend/client';
import { formatCurrency, formatDate } from '../utils/formatting';

const paymentModes = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK', label: 'Bank Transfer' },
  { value: 'OTHER', label: 'Other' },
];

export default function PaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    mode: 'CASH',
    txn_ref: '',
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const { data: invoices } = useQuery({
    queryKey: ['invoices', { invoice_id: invoiceId }],
    queryFn: () => backend.fees.listInvoices({}),
    enabled: !!invoiceId,
  });

  const invoice = invoices?.items.find(inv => inv.id === parseInt(invoiceId!));

  const paymentMutation = useMutation({
    mutationFn: backend.fees.createPayment,
    onSuccess: async (payment) => {
      try {
        const receipt = await backend.fees.getReceipt({ payment_id: payment.id });
        setReceiptData(receipt);
        setShowReceipt(true);
        toast({
          title: 'Payment Successful',
          description: `Payment of ${formatCurrency(parseFloat(paymentData.amount))} recorded successfully.`,
        });
      } catch (error) {
        console.error('Failed to fetch receipt:', error);
        toast({
          title: 'Payment Recorded',
          description: 'Payment was successful but receipt could not be loaded.',
        });
      }
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice) return;
    
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    if (amount > invoice.balance) {
      toast({
        title: 'Amount Too High',
        description: `Payment amount cannot exceed outstanding balance of ${formatCurrency(invoice.balance)}.`,
        variant: 'destructive',
      });
      return;
    }

    if (paymentData.mode !== 'CASH' && !paymentData.txn_ref.trim()) {
      toast({
        title: 'Transaction Reference Required',
        description: 'Please provide a transaction reference for non-cash payments.',
        variant: 'destructive',
      });
      return;
    }

    paymentMutation.mutate({
      invoice_id: invoice.id,
      amount,
      mode: paymentData.mode as any,
      txn_ref: paymentData.txn_ref.trim() || undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Invoice not found</h2>
          <Button className="mt-4" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Process Payment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Student</Label>
              <p className="text-sm font-semibold">{invoice.student_name}</p>
              <p className="text-sm text-gray-600">{invoice.student_roll} • {invoice.class}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Month</Label>
              <p className="text-sm font-semibold">{invoice.month}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium text-gray-600">Total Billed</Label>
              <p className="text-lg font-semibold">{formatCurrency(invoice.billed_total)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Paid</Label>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(invoice.paid_total)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Balance</Label>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(invoice.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balance}
                value={paymentData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter payment amount"
                required
              />
            </div>

            <div>
              <Label htmlFor="mode">Payment Mode</Label>
              <Select value={paymentData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paymentData.mode !== 'CASH' && (
              <div>
                <Label htmlFor="txn_ref">Transaction Reference</Label>
                <Input
                  id="txn_ref"
                  value={paymentData.txn_ref}
                  onChange={(e) => handleInputChange('txn_ref', e.target.value)}
                  placeholder="Enter transaction reference"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending ? 'Processing...' : 'Process Payment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <ReceiptPrint
              receipt={receiptData}
              onPrint={() => setShowReceipt(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
