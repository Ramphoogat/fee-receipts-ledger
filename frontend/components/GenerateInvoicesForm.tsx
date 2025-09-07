import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GenerateInvoicesFormProps {
  onSubmit: (data: {
    class: string;
    month: string;
    strategy?: 'DEFAULT_HEADS' | 'CUSTOM_PER_CLASS';
  }) => void;
  isLoading?: boolean;
}

const classOptions = [
  { value: '10-A', label: '10-A' },
  { value: '10-B', label: '10-B' },
  { value: '11-A', label: '11-A' },
  { value: '11-B', label: '11-B' },
  { value: '12-A', label: '12-A' },
  { value: '12-B', label: '12-B' },
];

export default function GenerateInvoicesForm({ onSubmit, isLoading }: GenerateInvoicesFormProps) {
  const [formData, setFormData] = useState({
    class: '',
    month: '',
    strategy: 'DEFAULT_HEADS' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.class && formData.month) {
      onSubmit(formData);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="class">Class</Label>
        <Select
          value={formData.class}
          onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
        >
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
        <Label htmlFor="month">Month</Label>
        <Input
          id="month"
          type="month"
          value={formData.month}
          onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
          placeholder="YYYY-MM"
          defaultValue={getCurrentMonth()}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading || !formData.class || !formData.month}>
          {isLoading ? 'Generating...' : 'Generate Invoices'}
        </Button>
      </div>
    </form>
  );
}
