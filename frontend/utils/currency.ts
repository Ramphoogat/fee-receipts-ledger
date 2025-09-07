import { useState, useEffect } from 'react';

export interface CurrencyOption {
  value: string;
  label: string;
  locale: string;
}

export const currencyOptions: CurrencyOption[] = [
  { value: 'INR', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  { value: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { value: 'EUR', label: 'Euro (€)', locale: 'en-US' },
  { value: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', locale: 'en-CA' },
  { value: 'AUD', label: 'Australian Dollar (A$)', locale: 'en-AU' },
  { value: 'JPY', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
  { value: 'CNY', label: 'Chinese Yuan (¥)', locale: 'zh-CN' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', locale: 'en-SG' },
  { value: 'AED', label: 'UAE Dirham (د.إ)', locale: 'ar-AE' },
  { value: 'SAR', label: 'Saudi Riyal (﷼)', locale: 'ar-SA' },
  { value: 'ZAR', label: 'South African Rand (R)', locale: 'en-ZA' },
  { value: 'BRL', label: 'Brazilian Real (R$)', locale: 'pt-BR' },
  { value: 'MXN', label: 'Mexican Peso ($)', locale: 'es-MX' },
  { value: 'KRW', label: 'South Korean Won (₩)', locale: 'ko-KR' },
  { value: 'THB', label: 'Thai Baht (฿)', locale: 'th-TH' },
  { value: 'MYR', label: 'Malaysian Ringgit (RM)', locale: 'ms-MY' },
  { value: 'PHP', label: 'Philippine Peso (₱)', locale: 'en-PH' },
  { value: 'IDR', label: 'Indonesian Rupiah (Rp)', locale: 'id-ID' },
  { value: 'VND', label: 'Vietnamese Dong (₫)', locale: 'vi-VN' },
];

const STORAGE_KEY = 'fee-management-currency';

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<string>('INR');

  useEffect(() => {
    const savedCurrency = localStorage.getItem(STORAGE_KEY);
    if (savedCurrency && currencyOptions.find(opt => opt.value === savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  };

  const formatCurrency = (amount: number): string => {
    const currencyOption = currencyOptions.find(opt => opt.value === currency);
    const locale = currencyOption?.locale || 'en-IN';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return {
    currency,
    setCurrency,
    formatCurrency,
    currencyOptions,
  };
};
