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
  TableSkeleton,
} from '@/components/ui/table';
import {
  ResponsiveTableContainer,
  MobileDataRow,
  MobileTableSkeleton,
  CompactStatus,
} from '@/components/ui/responsive-table';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  DetailItem,
} from '@/components/ui/bottom-sheet';
import { AgreementFormDialog } from '@/components/agreements/agreement-form-dialog';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import {
  FileText,
  Search,
  Plus,
  Ban,
  Edit,
  ExternalLink,
  User,
} from 'lucide-react';

export default function AgreementsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [search, setSearch] = useState('');
  const [editingAgreement, setEditingAgreement] = useState<RentalAgreement | null>(null);
  const [detailAgreement, setDetailAgreement] = useState<RentalAgreement | null>(null);

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

      {/* Responsive Agreements Table */}
      {isLoading ? (
        <ResponsiveTableContainer>
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
                  <TableHead className="min-w-[110px]">{t.unitNumber}</TableHead>
                  <TableHead align="right" className="min-w-[100px]">{t.baseRent}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.serviceFee}</TableHead>
                  <TableHead align="right" className="min-w-[105px]">{t.securityDeposit}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.dueDay}</TableHead>
                  <TableHead align="left" className="min-w-[105px]">{t.startDate}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[130px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton columns={9} rows={5} />
              </TableBody>
            </Table>
          </div>
          <div className="block md:hidden">
            <MobileTableSkeleton rows={5} />
          </div>
        </ResponsiveTableContainer>
      ) : visibleAgreements.length > 0 ? (
        <ResponsiveTableContainer>
          {/* Desktop Tabular View */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
                  <TableHead className="min-w-[110px]">{t.unitNumber}</TableHead>
                  <TableHead align="right" className="min-w-[100px]">{t.baseRent}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.serviceFee}</TableHead>
                  <TableHead align="right" className="min-w-[105px]">{t.securityDeposit}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.dueDay}</TableHead>
                  <TableHead align="left" className="min-w-[105px]">{t.startDate}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[130px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleAgreements.map((agr) => (
                  <TableRow key={agr.id}>
                    <TableCell className="min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <TenantAvatar
                          profilePictureId={agr.tenant?.profilePictureId}
                          name={agr.tenant?.name || 'Tenant'}
                          size="sm"
                          onClick={() => agr.tenant?.id && window.open(`/tenants/${agr.tenant.id}`, '_blank')}
                          ariaLabel={isEn ? 'View tenant profile' : 'ভাড়াটিয়ার প্রোফাইল দেখুন'}
                        />
                        <div className="min-w-0 max-w-[160px]">
                          <p className="truncate font-medium text-[#0F172A] text-sm" title={agr.tenant?.name || 'Tenant'}>
                            {agr.tenant?.name || 'Tenant'}
                          </p>
                          <p className="truncate text-xs text-[#64748B]" title={agr.tenant?.phone || ''}>
                            {agr.tenant?.phone || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[110px]">
                      <div className="min-w-0">
                        <span className="font-semibold text-[#1E293B] block">
                          {agr.unit?.unitNumber || '—'}
                        </span>
                        {!isSingleProperty && agr.unit?.property?.name && (
                          <span className="block text-xs text-[#64748B] truncate max-w-[120px]" title={agr.unit.property.name}>
                            {agr.unit.property.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right" className="font-semibold text-[#0F172A] whitespace-nowrap">
                      {formatCurrency(agr.monthlyRent, language)}
                    </TableCell>
                    <TableCell align="right" className="text-[#64748B] whitespace-nowrap">
                      {formatCurrency(agr.serviceFee, language)}
                    </TableCell>
                    <TableCell align="right" className="text-[#059669] font-medium whitespace-nowrap">
                      {formatCurrency(agr.securityDeposit, language)}
                    </TableCell>
                    <TableCell align="right" className="text-[#334155] font-medium text-xs whitespace-nowrap">
                      {isEn ? `Day ${agr.dueDay}` : `প্রতি মাসের ${agr.dueDay} তারিখ`}
                    </TableCell>
                    <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
                      {formatBnDate(agr.startDate, language)}
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge status={agr.status} lang={language} />
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/tenants/${agr.tenant?.id}`}>
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs px-2.5">
                            {isEn ? 'Profile' : 'প্রোফাইল'}<ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditAgreement(agr)}
                          className="h-8 w-8 text-[#64748B] hover:text-[#0F172A]"
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

          {/* Mobile 2-Line Rows */}
          <div className="block md:hidden divide-y divide-[#F1F5F9]">
            {visibleAgreements.map((agr) => {
              const isActive = agr.status === 'ACTIVE';
              return (
                <MobileDataRow
                  key={agr.id}
                  onClick={() => setDetailAgreement(agr)}
                  showChevron
                  identity={
                    <div className="flex items-center gap-2 min-w-0">
                      <TenantAvatar
                        profilePictureId={agr.tenant?.profilePictureId}
                        name={agr.tenant?.name || 'Tenant'}
                        size="sm"
                      />
                      <span className="truncate font-semibold text-sm text-[#0F172A]">
                        {agr.tenant?.name || 'Tenant'}
                      </span>
                    </div>
                  }
                  value={`${formatCurrency(agr.monthlyRent, language)}${isEn ? '/mo' : '/মাস'}`}
                  stateAndDetail={
                    <>
                      <CompactStatus
                        label={isActive ? (isEn ? 'Active' : 'সক্রিয়') : (isEn ? 'Ended' : 'সমাপ্ত')}
                        variant={isActive ? 'success' : 'neutral'}
                      />
                      <span className="text-slate-300">·</span>
                      <span>Unit {agr.unit?.unitNumber || '—'}</span>
                      {!isSingleProperty && agr.unit?.property?.name && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="truncate max-w-[120px]">{agr.unit.property.name}</span>
                        </>
                      )}
                    </>
                  }
                  action={
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditAgreement(agr)}
                        className="h-10 w-10 p-0 text-[#64748B] hover:text-[#0F172A]"
                        title={t.edit}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                />
              );
            })}
          </div>
        </ResponsiveTableContainer>
      ) : (
        <Card className="rounded-[10px] border-[#E2E8F0] shadow-none">
          <CardContent className="p-0">
            <EmptyState
              icon={FileText}
              title={isEn ? 'No Agreements Found' : 'কোনো চুক্তি পাওয়া যায়নি'}
              description={isEn ? 'Create a rental agreement to assign a tenant to a unit' : 'ফ্ল্যাটে ভাড়াটিয়া তোলার জন্য নতুন চুক্তি করুন'}
              actionLabel={t.addNewAgreement}
              onAction={handleOpenCreateAgreement}
            />
          </CardContent>
        </Card>
      )}

      {/* Row Details Bottom Sheet on Mobile */}
      <BottomSheet open={!!detailAgreement} onOpenChange={(open) => !open && setDetailAgreement(null)}>
        {detailAgreement && (
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>
                {detailAgreement.tenant?.name || 'Rental Agreement'}
              </BottomSheetTitle>
              <BottomSheetDescription>
                {detailAgreement.unit?.property?.name ? `${detailAgreement.unit.property.name} · ` : ''}
                Unit {detailAgreement.unit?.unitNumber || '—'}
              </BottomSheetDescription>
            </BottomSheetHeader>

            <div className="py-2">
              <DetailItem
                label={isEn ? 'Monthly Rent' : 'মাসিক ভাড়া'}
                value={formatCurrency(detailAgreement.monthlyRent, language)}
                isNumeric
                highlight
              />
              <DetailItem
                label={isEn ? 'Service Fee' : 'সার্ভিস ফি'}
                value={formatCurrency(detailAgreement.serviceFee, language)}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Security Deposit' : 'অগ্রিম জামানত'}
                value={formatCurrency(detailAgreement.securityDeposit, language)}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Rent Due Day' : 'পরিশোধের দিন'}
                value={isEn ? `Day ${detailAgreement.dueDay} of each month` : `প্রতি মাসের ${detailAgreement.dueDay} তারিখ`}
              />
              <DetailItem
                label={isEn ? 'Start Date' : 'শুরুর তারিখ'}
                value={formatBnDate(detailAgreement.startDate, language)}
              />
              {detailAgreement.endDate && (
                <DetailItem
                  label={isEn ? 'End Date' : 'সমাপ্তির তারিখ'}
                  value={formatBnDate(detailAgreement.endDate, language)}
                />
              )}
              <DetailItem
                label={isEn ? 'Status' : 'অবস্থা'}
                value={<StatusBadge status={detailAgreement.status} lang={language} />}
              />
              {detailAgreement.tenant?.phone && (
                <DetailItem
                  label={isEn ? 'Tenant Phone' : 'ফোন'}
                  value={detailAgreement.tenant.phone}
                />
              )}
            </div>

            <BottomSheetFooter>
              {detailAgreement.tenant?.id && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const id = detailAgreement.tenant?.id;
                    setDetailAgreement(null);
                    window.open(`/tenants/${id}`, '_blank');
                  }}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <User className="w-4 h-4 mr-2" />
                  {isEn ? 'View Profile' : 'প্রোফাইল দেখুন'}
                </Button>
              )}
              <Button
                onClick={() => {
                  const agr = detailAgreement;
                  setDetailAgreement(null);
                  handleEditAgreement(agr);
                }}
                className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] min-h-[44px]"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
              {detailAgreement.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const id = detailAgreement.id;
                    const name = detailAgreement.tenant?.name || 'tenant';
                    setDetailAgreement(null);
                    handleEndAgreement(id, name);
                  }}
                  className="w-full sm:w-auto min-h-[44px] text-[#DC2626] hover:bg-[#FEF2F2] border-[#FCA5A5]"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {t.endAgreement}
                </Button>
              )}
            </BottomSheetFooter>
          </BottomSheetContent>
        )}
      </BottomSheet>

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