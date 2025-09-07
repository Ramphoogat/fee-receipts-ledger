import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import backend from '~backend/client';
import { useCurrency } from '../utils/currency';

const classOptions = [
  { value: 'all', label: 'All Classes' },
  { value: 'Pre-Nursery', label: 'Pre-Nursery' },
  { value: 'Nursery', label: 'Nursery' },
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10-A', label: '10-A' },
  { value: '10-B', label: '10-B' },
  { value: '11-A', label: '11-A' },
  { value: '11-B', label: '11-B' },
  { value: '12-A', label: '12-A' },
  { value: '12-B', label: '12-B' },
];

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    month: '',
    class: 'all',
  });

  const { formatCurrency } = useCurrency();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => {
      const apiFilters: any = {};
      if (filters.month) apiFilters.month = filters.month;
      if (filters.class !== 'all') apiFilters.class = filters.class;
      return backend.fees.getReports(apiFilters);
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportSummary = () => {
    if (!reportData) return;

    const csvContent = [
      ['Summary Report - ' + (filters.month || 'All Months') + ' - ' + (filters.class === 'all' ? 'All Classes' : filters.class)],
      [''],
      ['Metric', 'Amount'],
      ['Total Billed', reportData.summary.total_billed.toString()],
      ['Total Collected', reportData.summary.total_collected.toString()],
      ['Total Outstanding', reportData.summary.total_outstanding.toString()],
      [''],
      ['Class-wise Breakdown'],
      ['Class', 'Students', 'Billed', 'Collected', 'Outstanding'],
      ...reportData.by_class.map(item => [
        item.class,
        item.student_count.toString(),
        item.billed.toString(),
        item.collected.toString(),
        item.outstanding.toString()
      ])
    ];

    if (reportData.by_head) {
      csvContent.push(
        [''],
        ['Fee Head-wise Breakdown'],
        ['Fee Head', 'Billed', 'Collected', 'Outstanding'],
        ...reportData.by_head.map(item => [
          item.head_name,
          item.billed.toString(),
          item.collected.toString(),
          item.outstanding.toString()
        ])
      );
    }

    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `fee-report-${dateStr}.csv`;
    link.click();
  };

  const collectionRate = reportData?.summary.total_billed > 0 
    ? (reportData.summary.total_collected / reportData.summary.total_billed) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Reports</h1>
          <p className="text-gray-600">View fee collection analytics and summaries</p>
        </div>
        <Button onClick={handleExportSummary} disabled={!reportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                placeholder="YYYY-MM"
              />
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
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
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reportData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Billed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData.summary.total_billed)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.total_collected)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.summary.total_outstanding)}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {collectionRate.toFixed(1)}%
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Class</th>
                        <th className="text-right py-2">Students</th>
                        <th className="text-right py-2">Billed</th>
                        <th className="text-right py-2">Collected</th>
                        <th className="text-right py-2">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.by_class.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{item.class}</td>
                          <td className="py-2 text-right">{item.student_count}</td>
                          <td className="py-2 text-right">{formatCurrency(item.billed)}</td>
                          <td className="py-2 text-right text-green-600">{formatCurrency(item.collected)}</td>
                          <td className="py-2 text-right text-red-600">{formatCurrency(item.outstanding)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {reportData.by_head && (
              <Card>
                <CardHeader>
                  <CardTitle>Fee Head-wise Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Fee Head</th>
                          <th className="text-right py-2">Billed</th>
                          <th className="text-right py-2">Collected</th>
                          <th className="text-right py-2">Outstanding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.by_head.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{item.head_name}</td>
                            <td className="py-2 text-right">{formatCurrency(item.billed)}</td>
                            <td className="py-2 text-right text-green-600">{formatCurrency(item.collected)}</td>
                            <td className="py-2 text-right text-red-600">{formatCurrency(item.outstanding)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
