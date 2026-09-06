'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { RentalAgreement, ApiResponse } from '@/lib/types';
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
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function AgreementsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEn ? 'Failed to end agreement' : 'চুক্তি সমাপ্ত করা সম্ভব হয়নি'));
    }
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

      {/* Agreements Table */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : agreements && agreements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.tenantName}</TableHead>
                  <TableHead>{t.unitNumber}</TableHead>
                  <TableHead>{t.baseRent}</TableHead>
                  <TableHead>{t.serviceFee}</TableHead>
                  <TableHead>{t.securityDeposit}</TableHead>
                  <TableHead>{t.dueDay}</TableHead>
                  <TableHead>{t.startDate}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((agr) => (
                  <TableRow key={agr.id}>
                    <TableCell data-label={t.tenantName} className="font-bold text-slate-900">
                      <div className="text-right sm:text-left">
                        <span>{agr.tenant?.name || 'Tenant'}</span>
                        <span className="block text-xs font-normal text-slate-500">{agr.tenant?.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell data-label={t.unitNumber}>
                      <div className="text-right sm:text-left">
                        <span className="font-semibold text-slate-800">{agr.unit?.unitNumber}</span>
                        <span className="block text-xs text-slate-500">{agr.unit?.property?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell data-label={t.baseRent} className="font-medium text-slate-900">
                      {formatCurrency(agr.monthlyRent, language)}
                    </TableCell>
                    <TableCell data-label={t.serviceFee} className="text-slate-600">
                      {formatCurrency(agr.serviceFee, language)}
                    </TableCell>
                    <TableCell data-label={t.securityDeposit} className="text-emerald-700 font-medium">
                      {formatCurrency(agr.securityDeposit, language)}
                    </TableCell>
                    <TableCell data-label={t.dueDay} className="text-slate-700 font-medium text-xs">
                      {isEn ? `Day ${agr.dueDay}` : `প্রতি মাসের ${agr.dueDay} তারিখ`}
                    </TableCell>
                    <TableCell data-label={t.startDate} className="text-xs text-slate-500">
                      {formatBnDate(agr.startDate, language)}
                    </TableCell>
                    <TableCell data-label={t.status}>
                      <StatusBadge status={agr.status} lang={language} />
                    </TableCell>
                    <TableCell data-label={t.actions} className="text-right">
                      {agr.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEndAgreement(agr.id, agr.tenant?.name || 'tenant')}
                          className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 font-medium"
                          title={t.endAgreement}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{t.endAgreement}</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      />
    </div>
  );
}
