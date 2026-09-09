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
} from '@/components/ui/table';
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog';
import {
  Wallet,
  Plus,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  Building2,
} from 'lucide-react';

export default function ExpensesPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [propertyFilter, setPropertyFilter] = useState<string>('');
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
    queryKey: ['expenses-list', categoryFilter, propertyFilter],
    queryFn: async () => {
      let url = `/expenses?limit=100`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (propertyFilter) url += `&propertyId=${propertyFilter}`;
      const res = await apiClient.get<ApiResponse<Expense[]>>(url);
      const raw = res.data?.data;
      // API may return paginated object { items, total } or a plain array
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray((raw as any).items)) return (raw as any).items as Expense[];
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEn ? 'Failed to delete' : 'মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.expenses}
        description={isEn ? 'Track maintenance, electricity, and operating costs' : 'বাড়ির যাবতীয় বিদ্যুৎ, গ্যাস, মেরামত ও পরিচালনা খরচ'}
        action={
          <Button onClick={handleCreate} variant="gradient" className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            {isEn ? 'Add Expense' : 'নতুন খরচ যোগ করুন'}
          </Button>
        }
      />

      {/* Filter and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t.properties}:</span>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none"
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
            <span className="text-xs font-semibold text-slate-500">{isEn ? 'Category:' : 'খাত:'}</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none"
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

        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
          <span className="text-xs font-semibold text-rose-800">{isEn ? 'Total Expenses:' : 'মোট খরচ:'}</span>
          <span className="text-base font-black text-rose-900">{formatCurrency(totalExpenseAmount, language)}</span>
        </div>
      </div>

      {/* Expenses Table */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : expenses && expenses.length > 0 ? (
            <Table className="p-2">
              <TableHeader>
                <TableRow>
                  <TableHead>{t.date}</TableHead>
                  <TableHead>{t.propertyName}</TableHead>
                  <TableHead>{isEn ? 'Category' : 'খরচের খাত'}</TableHead>
                  <TableHead>{t.amount}</TableHead>
                  <TableHead>{isEn ? 'Description' : 'বিবরণ'}</TableHead>
                  <TableHead>{t.paymentMethod}</TableHead>
                  <TableHead>{isEn ? 'Voucher' : 'ভাউচার'}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell data-label={t.date} className="text-xs text-slate-600 font-medium">
                      {formatBnDate(expense.expenseDate, language)}
                    </TableCell>
                    <TableCell data-label={t.propertyName} className="font-semibold text-slate-900">
                      {expense.property?.name || 'Property'}
                    </TableCell>
                    <TableCell data-label={isEn ? 'Category' : 'খরচের খাত'}>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell data-label={t.amount} className="font-bold text-rose-600 text-sm">
                      {formatCurrency(expense.amount, language)}
                    </TableCell>
                    <TableCell data-label={isEn ? 'Description' : 'বিবরণ'} className="text-xs text-slate-600 max-w-xs truncate">
                      {expense.description || '-'}
                    </TableCell>
                    <TableCell data-label={t.paymentMethod} className="text-xs text-slate-600">
                      {expense.paymentMethod}
                    </TableCell>
                    <TableCell data-label={isEn ? 'Voucher' : 'ভাউচার'} className="font-mono text-xs text-slate-500">
                      {expense.reference || '-'}
                    </TableCell>
                    <TableCell data-label={t.actions} className="text-right">
                      <div className="flex items-center justify-end gap-1 table-actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(expense)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(expense.id)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
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
            <EmptyState
              icon={Wallet}
              title={isEn ? 'No Expense Records' : 'কোনো খরচের রেকর্ড নেই'}
              description={isEn ? 'Track electricity and repair costs by adding your first expense' : 'বাড়ির খরচের হিসাব রাখতে নতুন খরচ যুক্ত করুন'}
              actionLabel={isEn ? 'Add Expense' : 'নতুন খরচ যোগ করুন'}
              onAction={handleCreate}
            />
          )}
        </CardContent>
      </Card>

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
