'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { MonthlyRent, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { RentNoticeDialog, WhatsAppIcon } from './rent-notice-dialog';
import {
  FileText,
  Loader2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  buildNoticeWhatsAppText,
  getWhatsAppShareUrl,
  openWhatsAppUrl,
  validateAndNormalizePhone,
} from '@/lib/whatsapp-receipt';
import { toast } from 'sonner';

const monthsBn = [
  { value: 1, label: 'জানুয়ারি (January)' },
  { value: 2, label: 'ফেব্রুয়ারি (February)' },
  { value: 3, label: 'মার্চ (March)' },
  { value: 4, label: 'এপ্রিল (April)' },
  { value: 5, label: 'মে (May)' },
  { value: 6, label: 'জুন (June)' },
  { value: 7, label: 'জুলাই (July)' },
  { value: 8, label: 'আগস্ট (August)' },
  { value: 9, label: 'সেপ্টেম্বর (September)' },
  { value: 10, label: 'অক্টোবর (October)' },
  { value: 11, label: 'নভেম্বর (November)' },
  { value: 12, label: 'ডিসেম্বর (December)' },
];

interface GenerateRentNoticesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateRentNoticesDialog({
  open,
  onOpenChange,
}: GenerateRentNoticesDialogProps) {
  const { language } = useLanguageStore();
  const isEn = language === 'en';

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed

  // Default to current month for new payment requests, allow switching to previous months
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [unpaidOnly, setUnpaidOnly] = useState<boolean>(true);

  // Active notice to display in the canonical document viewer
  const [activeNoticeRent, setActiveNoticeRent] = useState<MonthlyRent | null>(null);

  // Fetch properties for filter
  const { data: properties } = useQuery({
    queryKey: ['properties-notices-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  // Fetch existing rent invoices for the selected month & filters
  const {
    data: rentInvoices,
    isLoading,
  } = useQuery({
    queryKey: ['monthly-rents-notices', selectedYear, selectedMonth, selectedPropertyId],
    queryFn: async () => {
      let url = `/monthly-rents?year=${selectedYear}&month=${selectedMonth}&limit=100`;
      if (selectedPropertyId) url += `&propertyId=${selectedPropertyId}`;
      const res = await apiClient.get<ApiResponse<MonthlyRent[]>>(url);
      return res.data?.data || [];
    },
    enabled: open,
  });

  const filteredInvoices = React.useMemo(() => {
    if (!rentInvoices) return [];
    if (unpaidOnly) {
      return rentInvoices.filter((r) => Number(r.remainingAmount) > 0);
    }
    return rentInvoices;
  }, [rentInvoices, unpaidOnly]);

  const handleQuickWhatsApp = (rentItem: MonthlyRent) => {
    const tenant = rentItem.agreement?.tenant;
    const unit = rentItem.agreement?.unit;
    const property = unit?.property;
    const rawPhone = tenant?.phone;
    const phoneResult = validateAndNormalizePhone(rawPhone);

    const text = buildNoticeWhatsAppText({
      tenantName: tenant?.name,
      unitNumber: unit?.unitNumber,
      propertyName: property?.name,
      month: rentItem.month,
      year: rentItem.year,
      totalAmount: rentItem.totalAmount,
      paidAmount: rentItem.paidAmount,
      remainingAmount: rentItem.remainingAmount,
      dueDate: rentItem.dueDate,
      isEn,
    });

    const targetPhone = phoneResult.isValid ? phoneResult.normalizedPhone : '';
    const waUrl = getWhatsAppShareUrl(targetPhone, text);
    const { popupBlocked } = openWhatsAppUrl(waUrl);

    if (popupBlocked) {
      // If popup was blocked, open canonical preview dialog so landlord has manual button & copy options
      setActiveNoticeRent(rentItem);
      toast.warning(
        isEn
          ? 'Browser blocked WhatsApp popup. Opening notice preview...'
          : 'ব্রাউজার পপ-আপ ব্লক করেছে। নোটিশ প্রিভিউ খোলা হচ্ছে...'
      );
    } else {
      if (phoneResult.isValid) {
        toast.success(
          isEn
            ? `Opening WhatsApp chat for ${tenant?.name || phoneResult.normalizedPhone}...`
            : `${tenant?.name || phoneResult.normalizedPhone}-এর হোয়াটসঅ্যাপ চ্যাট খোলা হচ্ছে...`
        );
      } else {
        toast.info(
          isEn
            ? 'Tenant has no phone number recorded. Opening WhatsApp contact selector...'
            : 'ভাড়াটিয়ার ফোন নম্বর নেই। কন্টাক্ট নির্বাচন করতে হোয়াটসঅ্যাপ খোলা হচ্ছে...'
        );
      }
    }
  };

  return (
    <>
      <Dialog open={open && !activeNoticeRent} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-emerald-600" />
              {isEn ? 'Generate & Send Rent Notices' : 'ভাড়ার নোটিশ তৈরি ও প্রেরণ'}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? 'Generate payment request notices from existing rent invoices. Does not duplicate invoices or modify payment records.'
                : 'বিদ্যমান ভাড়ার হিসাবের ভিত্তিতে ভাড়াটিয়াদের জন্য পরিশোধের নোটিশ তৈরি করুন। এটি কোনো ডুপ্লিকেট বিল তৈরি করে না।'}
            </DialogDescription>
          </DialogHeader>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <Label htmlFor="noticeMonth" className="text-xs font-semibold text-slate-700">
                {isEn ? 'Rent Month' : 'ভাড়ার মাস'}
              </Label>
              <select
                id="noticeMonth"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-emerald-500"
              >
                {monthsBn.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="noticeYear" className="text-xs font-semibold text-slate-700">
                {isEn ? 'Year' : 'সাল'}
              </Label>
              <Input
                id="noticeYear"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-9 font-semibold text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="noticeProperty" className="text-xs font-semibold text-slate-700">
                {isEn ? 'Property' : 'বাড়ি নির্বাচন'}
              </Label>
              <select
                id="noticeProperty"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{isEn ? '-- All Properties --' : '-- সকল বাড়ি --'}</option>
                {properties?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={unpaidOnly}
                onChange={(e) => setUnpaidOnly(e.target.checked)}
                className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              {isEn ? 'Show only unpaid & partial balances' : 'শুধুমাত্র বকেয়া ও আংশিক পরিশোধিত বিল দেখান'}
            </label>

            <span className="text-xs text-slate-500 font-medium">
              {isEn ? `Found: ${filteredInvoices.length} invoices` : `মোট প্রাপ্ত: ${filteredInvoices.length} টি বিল`}
            </span>
          </div>

          {/* Results List */}
          <div className="space-y-2.5 pt-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">{isEn ? 'Loading rent records...' : 'ভাড়ার হিসাব লোড হচ্ছে...'}</span>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  {isEn ? 'No rent invoices found for this period' : 'এই মাসের জন্য কোনো ভাড়ার বিল পাওয়া যায়নি'}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isEn
                    ? 'If invoices for this month have not been generated yet, click "Generate Rent" first to create invoices without recording payments.'
                    : 'যদি এই মাসের ভাড়ার হিসাব এখনও তৈরি না হয়ে থাকে, তবে প্রথমে "ভাড়া তৈরি করুন" দিয়ে মাসিক বিল তৈরি করে নিন।'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {filteredInvoices.map((inv) => {
                  const tenant = inv.agreement?.tenant;
                  const unit = inv.agreement?.unit;
                  const property = unit?.property;

                  return (
                    <div
                      key={inv.id}
                      className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {tenant?.name || 'Tenant'}
                          </span>
                          <span className="text-xs text-slate-500">
                            • {unit?.unitNumber} ({property?.name})
                          </span>
                          <StatusBadge status={inv.status} lang={language} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>
                            {isEn ? 'Total:' : 'মোট:'} <strong className="text-slate-800">{formatCurrency(inv.totalAmount, language)}</strong>
                          </span>
                          {Number(inv.paidAmount) > 0 && (
                            <span className="text-emerald-700">
                              {isEn ? 'Paid:' : 'পরিশোধিত:'} {formatCurrency(inv.paidAmount, language)}
                            </span>
                          )}
                          <span className="text-amber-800 font-semibold">
                            {isEn ? 'Due:' : 'বকেয়া:'} {formatCurrency(inv.remainingAmount, language)}
                          </span>
                          <span>
                            {isEn ? 'Due Date:' : 'মেয়াদ:'} {formatBnDate(inv.dueDate, language)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveNoticeRent(inv)}
                          className="gap-1.5 h-8 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          {isEn ? 'View Notice' : 'নোটিশ দেখুন'}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleQuickWhatsApp(inv)}
                          className="gap-1.5 h-8 text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          {isEn ? 'WhatsApp' : 'হোয়াটসঅ্যাপ'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Canonical Notice Document Dialog */}
      {activeNoticeRent && (
        <RentNoticeDialog
          rent={activeNoticeRent}
          open={!!activeNoticeRent}
          onOpenChange={(isOpen) => {
            if (!isOpen) setActiveNoticeRent(null);
          }}
        />
      )}
    </>
  );
}
