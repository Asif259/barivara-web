'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { RentalAgreement, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { AgreementFormDialog } from '@/components/agreements/agreement-form-dialog';
import {
  FileText,
  Plus,
  Ban,
  Edit,
} from 'lucide-react';

export default function AgreementsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [editingAgreement, setEditingAgreement] = useState<RentalAgreement | null>(null);

  // Fetch properties to determine if single property
  const { data: properties } = useQuery({
    queryKey: ['properties-list'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties');
      return res.data?.data || [];
    },
  });

  const isSingleProperty = (properties?.length || 0) <= 1;

  const {
    data: agreements,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['agreements-list', statusFilter],
    queryFn: async () => {
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      const res = await apiClient.get<ApiResponse<RentalAgreement[]>>(`/rental-agreements?limit=50${statusParam}`);
      return res.data?.data || [];
    },
  });

  const handleEndAgreement = async (id: string, tenantName: string) => {
    if (!confirm(isEn ? `Are you sure you want to end the agreement for ${tenantName}? The unit will be marked VACANT.` : `আপনি কি ${tenantName}-এর চুক্তি সমাপ্ত করতে চান? ফ্ল্যাটটি পুনরায় খালি (VACANT) হিসেবে চিহ্নিত হবে।`)) {
      return;
    }
    try {
      await apiClient.post(`/rental-agreements/${id}/end`);
      toast.success(isEn ? 'Agreement terminated successfully' : 'ভাড়া চুক্তি সমাপ্ত করা হয়েছে');
      refetch();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || (isEn ? 'Failed to end agreement' : 'চুক্তি সমাপ্ত করা সম্ভব হয়নি'));
    }
  };

  const handleEditAgreement = (agreement: RentalAgreement) => {
    setEditingAgreement(agreement);
    setAgreementDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.agreements}
        description={isEn ? 'Manage active and ended tenant leases' : 'ভাড়াটিয়া ও ফ্ল্যাটের সক্রিয় এবং পূর্ববর্তী চুক্তিসমূহ'}
        action={
          <Button onClick={() => setAgreementDialogOpen(true)} variant="gradient" className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            {t.addNewAgreement}
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('ACTIVE')}
          className="rounded-xl text-xs"
        >
          {t.activeAgreement}
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'ENDED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('ENDED')}
          className="rounded-xl text-xs"
        >
          {t.endedAgreement}
        </Button>
        <Button
          size="sm"
          variant={statusFilter === '' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('')}
          className="rounded-xl text-xs"
        >
          {t.all}
        </Button>
      </div>

      {/* Compact, Information-Dense Agreements Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : agreements && agreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full md:table-fixed md:min-w-[900px] p-2">
                <TableHeader className="bg-slate-100/80">
                  <TableRow>
                    <TableHead className="w-[170px]">{t.tenantName}</TableHead>
                    <TableHead className="w-[95px]">{t.unitNumber}</TableHead>
                    <TableHead className="w-[105px]">{t.baseRent}</TableHead>
                    <TableHead className="w-[100px]">{t.serviceFee}</TableHead>
                    <TableHead className="w-[100px]">{t.securityDeposit}</TableHead>
                    <TableHead className="w-[100px]">{t.dueDay}</TableHead>
                    <TableHead className="w-[105px]">{t.startDate}</TableHead>
                    <TableHead className="w-[105px]">{t.status}</TableHead>
                    <TableHead className="w-[100px] text-center">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agr) => (
                    <TableRow key={agr.id}>
                      <TableCell data-label={t.tenantName} className="font-bold text-slate-900">
                        <div className="text-right sm:text-left">
                          <span className="block cell-clamp-2" title={agr.tenant?.name || 'Tenant'}>{agr.tenant?.name || 'Tenant'}</span>
                          <span className="block text-xs font-normal text-slate-500">{agr.tenant?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell data-label={t.unitNumber}>
                        <div className="text-right sm:text-left">
                          <span className="font-semibold text-slate-800">{agr.unit?.unitNumber}</span>
                          {!isSingleProperty && agr.unit?.property?.name && (
                            <span className="block text-xs text-slate-500 cell-clamp-2" title={agr.unit.property.name}>{agr.unit.property.name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-label={t.baseRent} className="font-medium text-slate-900 whitespace-nowrap">
                        {formatCurrency(agr.monthlyRent, language)}
                      </TableCell>
                      <TableCell data-label={t.serviceFee} className="text-slate-600 whitespace-nowrap">
                        {formatCurrency(agr.serviceFee, language)}
                      </TableCell>
                      <TableCell data-label={t.securityDeposit} className="text-emerald-700 font-medium whitespace-nowrap">
                        {formatCurrency(agr.securityDeposit, language)}
                      </TableCell>
                      <TableCell data-label={t.dueDay} className="text-slate-700 font-medium text-xs whitespace-nowrap">
                        {isEn ? `Day ${agr.dueDay}` : `প্রতি মাসের ${agr.dueDay} তারিখ`}
                      </TableCell>
                      <TableCell data-label={t.startDate} className="text-xs text-slate-500 whitespace-nowrap">
                        {formatBnDate(agr.startDate, language)}
                      </TableCell>
                      <TableCell data-label={t.status}>
                        <StatusBadge status={agr.status} lang={language} />
                      </TableCell>
                      <TableCell data-label={t.actions} className="text-center">
                        <div className="flex items-center justify-end table-actions gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAgreement(agr)}
                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 border border-emerald-200"
                            title={t.edit}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>{t.edit}</span>
                          </Button>
                          {agr.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEndAgreement(agr.id, agr.tenant?.name || 'tenant')}
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 border border-rose-200"
                              title={t.endAgreement}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{isEn ? 'End' : 'শেষ'}</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={isEn ? 'No Agreements Found' : 'কোনো চুক্তি পাওয়া যায়নি'}
              description={isEn ? 'Create a rental agreement to assign a tenant to a unit' : 'ফ্ল্যাটে ভাড়াটিয়া তোলার জন্য নতুন চুক্তি করুন'}
              actionLabel={t.addNewAgreement}
              onAction={() => setAgreementDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* Agreement Form Dialog */}
      <AgreementFormDialog
        open={agreementDialogOpen}
        onOpenChange={setAgreementDialogOpen}
        onSuccess={refetch}
        agreement={editingAgreement}
        isEditing={!!editingAgreement}
      />
    </div>
  );
}
