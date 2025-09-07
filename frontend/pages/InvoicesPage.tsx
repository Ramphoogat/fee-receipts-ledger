import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import InvoiceTable from '../components/InvoiceTable';
import GenerateInvoicesForm from '../components/GenerateInvoicesForm';
import backend from '~backend/client';
import { formatCurrency } from '../utils/formatting';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
];

const classOptions = [
  { value: 'all', label: 'All Classes' },
  { value: '10-A', label: '10-A' },
  { value: '10-B', label: '10-B' },
  { value: '11-A', label: '11-A' },
  { value: '11-B', label: '11-B' },
  { value: '12-A', label: '12-A' },
  { value: '12-B', label: '12-B' },
];

export default function InvoicesPage() {
  const [filters, setFilters] = useState({
    class: 'all',
    month: '',
    status: 'all',
    q: '',
  });
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => {
      const apiFilters: any = {};
      if (filters.class !== 'all') apiFilters.class = filters.class;
      if (filters.month) apiFilters.month = filters.month;
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.q) apiFilters.q = filters.q;
      return backend.fees.listInvoices(apiFilters);
    },
  });

  const generateMutation = useMutation({
    mutationFn: backend.fees.generateInvoices,
    onSuccess: (data) => {
      toast({
        title: 'Invoices Generated',
        description: `Created ${data.created} new invoices, updated ${data.updated} existing invoices.`,
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowGenerateForm(false);
    },
    onError: (error) => {
      console.error('Generate invoices error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoices. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Invoices</h1>
          <p className="text-gray-600">Manage student fee invoices and payments</p>
        </div>
        <Dialog open={showGenerateForm} onOpenChange={setShowGenerateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Generate Invoices</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Invoices</DialogTitle>
            </DialogHeader>
            <GenerateInvoicesForm
              onSubmit={(data) => generateMutation.mutate(data)}
              isLoading={generateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <Select value={filters.class} onValueChange={(value) => handleFilterChange('class', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <Input
              type="month"
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              placeholder="YYYY-MM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search student name or roll..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {invoicesData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(invoicesData.billed_sum)}
              </div>
              <div className="text-sm text-gray-600">Total Billed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(invoicesData.paid_sum)}
              </div>
              <div className="text-sm text-gray-600">Total Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(invoicesData.balance_sum)}
              </div>
              <div className="text-sm text-gray-600">Outstanding</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {invoicesData.total}
              </div>
              <div className="text-sm text-gray-600">Total Invoices</div>
            </div>
          </div>
        </div>
      )}

      <InvoiceTable
        invoices={invoicesData?.items || []}
        isLoading={isLoading}
      />
    </div>
  );
}
