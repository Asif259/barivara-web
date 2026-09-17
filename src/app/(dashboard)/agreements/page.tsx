'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { RentalAgreement, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import {
  FileText,
  Search,
  Plus,
  Ban,
  Edit,
  ExternalLink,
} from 'lucide-react';

export default function AgreementsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [search, setSearch] = useState('');
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

  const visibleAgreements = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return agreements || [];
    return (agreements || []).filter((agreement) => [
      agreement.tenant?.name,
      agreement.tenant?.phone,
      agreement.unit?.unitNumber,
      agreement.unit?.property?.name,
    ].some((value) => value?.toLowerCase().includes(term)));
  }, [agreements, search]);

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

  const handleOpenCreateAgreement = () => {
    setEditingAgreement(null);
    setAgreementDialogOpen(true);
  };

  const handleEditAgreement = (agreement: RentalAgreement) => {
    setEditingAgreement(agreement);
    setAgreementDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setAgreementDialogOpen(open);
    if (!open) {
      setEditingAgreement(null);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.agreements}
        description={isEn ? 'Manage active and ended tenant leases' : 'ভাড়াটিয়া ও ফ্ল্যাটের সক্রিয় এবং পূর্ববর্তী চুক্তিসমূহ'}
        action={
          <Button onClick={handleOpenCreateAgreement} variant="default" className="h-10 gap-2">
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
          className="rounded-lg text-xs"
        >
          {t.activeAgreement}
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'ENDED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('ENDED')}
          className="rounded-lg text-xs"
        >
          {t.endedAgreement}
        </Button>
        <Button
          size="sm"
          variant={statusFilter === '' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('')}
          className="rounded-lg text-xs"
        >
          {t.all}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isEn ? 'Search tenant, phone, unit, or property' : 'ভাড়াটিয়া, ফোন, ইউনিট বা বাড়ি খুঁজুন'} className="pl-10" />
        </div>
        <p className="text-xs text-[#6B7280]">{visibleAgreements.length} {isEn ? 'agreements' : 'টি চুক্তি'}</p>
      </div>

      {/* Compact, Information-Dense Agreements Table */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            ) : visibleAgreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FAFAF9]">
                  <TableRow>
                    <TableHead className="w-[170px]">{t.tenantName}</TableHead>
                    <TableHead className="w-[95px]">{t.unitNumber}</TableHead>
                    <TableHead className="w-[105px]">{t.baseRent}</TableHead>
                    <TableHead className="w-[100px]">{t.serviceFee}</TableHead>
                    <TableHead className="w-[100px]">{t.securityDeposit}</TableHead>
                    <TableHead className="w-[100px]">{t.dueDay}</TableHead>
                    <TableHead className="w-[105px]">{t.startDate}</TableHead>
                    <TableHead className="w-[105px] text-center">{t.status}</TableHead>
                    <TableHead className="w-[100px] text-center">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAgreements.map((agr) => (
                    <TableRow key={agr.id}>
                      <TableCell data-label={t.tenantName} className="min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <TenantAvatar
                            profilePictureId={agr.tenant?.profilePictureId}
                            name={agr.tenant?.name || 'Tenant'}
                            size="md"
                            onClick={() => agr.tenant?.id && window.open(`/tenants/${agr.tenant.id}`, '_blank')}
                            ariaLabel={isEn ? 'View tenant profile' : 'ভাড়াটিয়ার প্রোফাইল দেখুন'}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#171717]">{agr.tenant?.name || 'Tenant'}</p>
                            <p className="mt-0.5 text-xs text-[#6B7280]">{agr.tenant?.phone || (isEn ? 'No phone number' : 'ফোন নম্বর নেই')}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-label={t.unitNumber}>
                        <div className="text-right sm:text-left">
                          <span className="font-semibold text-[#374151]">{agr.unit?.unitNumber}</span>
                          {!isSingleProperty && agr.unit?.property?.name && (
                            <span className="block text-xs text-[#6B7280] cell-clamp-2" title={agr.unit.property.name}>{agr.unit.property.name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-label={t.baseRent} className="font-medium text-[#171717] whitespace-nowrap">
                        {formatCurrency(agr.monthlyRent, language)}
                      </TableCell>
                      <TableCell data-label={t.serviceFee} className="text-[#6B7280] whitespace-nowrap">
                        {formatCurrency(agr.serviceFee, language)}
                      </TableCell>
                      <TableCell data-label={t.securityDeposit} className="text-[#12664F] font-medium whitespace-nowrap">
                        {formatCurrency(agr.securityDeposit, language)}
                      </TableCell>
                      <TableCell data-label={t.dueDay} className="text-[#374151] font-medium text-xs whitespace-nowrap">
                        {isEn ? `Day ${agr.dueDay}` : `প্রতি মাসের ${agr.dueDay} তারিখ`}
                      </TableCell>
                      <TableCell data-label={t.startDate} className="text-xs text-[#6B7280] whitespace-nowrap">
                        {formatBnDate(agr.startDate, language)}
                      </TableCell>
                      <TableCell data-label={t.status}>
                        <StatusBadge status={agr.status} lang={language} />
                      </TableCell>
                      <TableCell data-label={t.actions} className="text-right">
                        <div className="flex items-center justify-end gap-1 table-actions">
                          <Link href={`/tenants/${agr.tenant?.id}`}>
                            <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs">
                              {isEn ? 'Profile' : 'প্রোফাইল'}<ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditAgreement(agr)}
                            className="h-8 w-8 text-[#6B7280] hover:text-[#171717]"
                            title={t.edit}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {agr.status === 'ACTIVE' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEndAgreement(agr.id, agr.tenant?.name || 'tenant')}
                              className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]"
                              title={t.endAgreement}
                            >
                              <Ban className="w-3.5 h-3.5" />
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
              onAction={handleOpenCreateAgreement}
            />
          )}
        </CardContent>
      </Card>

      {/* Agreement Form Dialog */}
      <AgreementFormDialog
        open={agreementDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={refetch}
        agreement={editingAgreement}
        isEditing={!!editingAgreement}
      />
    </div>
  );
}