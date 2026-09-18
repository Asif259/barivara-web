'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Expense, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
} from '@/components/ui/table';
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog';
import {
  Wallet,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';

export default function ExpensesPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [propertyFilter, setPropertyFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 1. Fetch Properties
  const { data: properties } = useQuery({
    queryKey: ['properties-expenses-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
  });

  // 2. Fetch Expenses
  const {
    data: expenses,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['expenses-list', categoryFilter, propertyFilter, search],
    queryFn: async () => {
      let url = `/expenses?limit=100`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (propertyFilter) url += `&propertyId=${propertyFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await apiClient.get<ApiResponse<Expense[]>>(url);
      const raw = res.data?.data;
      // API may return paginated object { items, total } or a plain array
      if (Array.isArray(raw)) return raw;
      const paginated = raw as unknown as { items?: unknown };
      if (paginated && Array.isArray(paginated.items)) return paginated.items as Expense[];
      return [] as Expense[];
    },
  });

  const totalExpenseAmount = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

  const handleCreate = () => {
    setEditingExpense(null);
    setExpenseDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isEn ? 'Are you sure you want to delete this expense record?' : 'আপনি কি নিশ্চিতভাবে এই খরচের হিসাবটি মুছে ফেলতে চান?')) {
      return;
    }
    try {
      await apiClient.delete(`/expenses/${id}`);
      toast.success(isEn ? 'Expense deleted successfully' : 'খরচের হিসাব মুছে ফেলা হয়েছে');
      refetch();
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || (isEn ? 'Failed to delete' : 'মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.expenses}
        description={isEn ? 'Track maintenance, electricity, and operating costs' : 'বাড়ির যাবতীয় বিদ্যুৎ, গ্যাস, মেরামত ও পরিচালনা খরচ'}
        action={
          <Button onClick={handleCreate} variant="default" className="h-10 gap-2">
            <Plus className="w-4 h-4" />
            {isEn ? 'Add Expense' : 'নতুন খরচ যোগ করুন'}
          </Button>
        }
      />

      {/* Filter and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-3 rounded-[10px] border border-[#E5E7EB] shadow-none">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B7280]">{t.properties}:</span>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none"
            >
              <option value="">{isEn ? 'All Properties' : 'সকল বাড়ি'}</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B7280]">{isEn ? 'Category:' : 'খাত:'}</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none"
            >
              <option value="">{t.all}</option>
              <option value="ELECTRICITY">Electricity (বিদ্যুৎ)</option>
              <option value="WATER">Water (পানি)</option>
              <option value="GAS">Gas (গ্যাস)</option>
              <option value="MAINTENANCE">Maintenance (রক্ষণাবেক্ষণ)</option>
              <option value="REPAIR">Repair (মেরামত)</option>
              <option value="SECURITY">Security (গার্ড)</option>
              <option value="CLEANING">Cleaning (পরিচ্ছন্নতা)</option>
              <option value="SALARY">Salary (বেতন)</option>
              <option value="TAX">Tax (পৌরকর)</option>
              <option value="OTHER">Other (অন্যান্য)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#FEF7F7] px-4 py-2 rounded-lg border border-[#FECACA]">
          <span className="text-xs font-semibold text-[#B91C1C]">{isEn ? 'Total Expenses:' : 'মোট খরচ:'}</span>
          <span className="text-base font-black text-[#991B1B]">{formatCurrency(totalExpenseAmount, language)}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input placeholder={isEn ? 'Search property, category, description, or voucher' : 'বাড়ি, খাত, বিবরণ বা ভাউচার খুঁজুন'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <p className="text-xs text-[#6B7280]">{expenses ? `${expenses.length} ${isEn ? 'expenses' : 'টি খরচ'}` : ''}</p>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead align="left" className="min-w-[105px]">{t.date}</TableHead>
              <TableHead className="min-w-[150px]">{t.propertyName}</TableHead>
              <TableHead align="left" className="min-w-[110px]">{isEn ? 'Category' : 'খরচের খাত'}</TableHead>
              <TableHead align="right" className="min-w-[110px]">{t.amount}</TableHead>
              <TableHead align="left" className="min-w-[180px]">{isEn ? 'Description' : 'বিবরণ'}</TableHead>
              <TableHead align="center" className="min-w-[100px]">{t.paymentMethod}</TableHead>
              <TableHead align="left" className="min-w-[110px]">{isEn ? 'Voucher' : 'ভাউচার'}</TableHead>
              <TableHead align="right" className="min-w-[90px]">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeleton columns={8} rows={5} />
          </TableBody>
        </Table>
      ) : expenses && expenses.length > 0 ? (
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead align="left" className="min-w-[105px]">{t.date}</TableHead>
              <TableHead className="min-w-[150px]">{t.propertyName}</TableHead>
              <TableHead align="left" className="min-w-[110px]">{isEn ? 'Category' : 'খরচের খাত'}</TableHead>
              <TableHead align="right" className="min-w-[110px]">{t.amount}</TableHead>
              <TableHead align="left" className="min-w-[180px]">{isEn ? 'Description' : 'বিবরণ'}</TableHead>
              <TableHead align="center" className="min-w-[100px]">{t.paymentMethod}</TableHead>
              <TableHead align="left" className="min-w-[110px]">{isEn ? 'Voucher' : 'ভাউচার'}</TableHead>
              <TableHead align="right" className="min-w-[90px]">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
                  {formatBnDate(expense.expenseDate, language)}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <span className="font-semibold text-[#0F172A] block truncate max-w-[160px]" title={expense.property?.name || 'Property'}>
                    {expense.property?.name || '—'}
                  </span>
                </TableCell>
                <TableCell align="left">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] whitespace-nowrap">
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell align="right" className="font-bold text-[#DC2626] text-sm whitespace-nowrap">
                  {formatCurrency(expense.amount, language)}
                </TableCell>
                <TableCell align="left" className="min-w-[180px]">
                  <span className="text-xs text-[#64748B] block truncate max-w-[200px]" title={expense.description || ''}>
                    {expense.description || '—'}
                  </span>
                </TableCell>
                <TableCell align="center" className="text-xs text-[#64748B] whitespace-nowrap">
                  {expense.paymentMethod || '—'}
                </TableCell>
                <TableCell align="left" className="font-mono text-xs text-[#64748B] whitespace-nowrap">
                  {expense.reference || '—'}
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(expense)}
                      className="h-8 w-8 p-0 text-[#64748B] hover:text-[#0F172A]"
                      title={isEn ? 'Edit' : 'সম্পাদনা'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(expense.id)}
                      className="h-8 w-8 p-0 text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2]"
                      title={isEn ? 'Delete' : 'মুছুন'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card className="rounded-[10px] border-[#E2E8F0] shadow-none">
          <CardContent className="p-0">
            <EmptyState
              icon={Wallet}
              title={isEn ? 'No Expense Records' : 'কোনো খরচের রেকর্ড নেই'}
              description={isEn ? 'Track electricity and repair costs by adding your first expense' : 'বাড়ির খরচের হিসাব রাখতে নতুন খরচ যুক্ত করুন'}
              actionLabel={isEn ? 'Add Expense' : 'নতুন খরচ যোগ করুন'}
              onAction={handleCreate}
            />
          </CardContent>
        </Card>
      )}

      {/* Expense Form Modal Dialog */}
      <ExpenseFormDialog
        expense={editingExpense}
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}