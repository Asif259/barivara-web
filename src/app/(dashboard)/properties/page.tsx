'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Property, ApiResponse } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSkeleton } from '@/components/ui/table';
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
import { PropertyFormDialog } from '@/components/properties/property-form-dialog';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Home,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function PropertiesPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['properties-list', search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await apiClient.get<ApiResponse<Property[]>>(`/properties?limit=50${searchParam}`);
      return res.data?.data || [];
    },
  });

  const handleEdit = (p: Property) => {
    setEditingProperty(p);
    setPropertyDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProperty(null);
    setPropertyDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete "${name}"?` : `আপনি কি নিশ্চিতভাবে "${name}" মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await apiClient.delete(`/properties/${id}`);
      toast.success(isEn ? 'Property deleted successfully' : 'বাড়ি মুছে ফেলা হয়েছে');
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
        title={t.properties}
        description={isEn ? 'Manage buildings, addresses, and units from one place.' : 'বাড়ি, ঠিকানা এবং ইউনিট এক জায়গা থেকে পরিচালনা করুন।'}
        action={
          <Button onClick={handleCreate} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t.addNewProperty}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder={isEn ? 'Search by name, address, or city' : 'নাম, ঠিকানা বা শহর দিয়ে খুঁজুন'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-[#6B7280]">
          {properties ? `${properties.length} ${isEn ? 'properties' : 'টি বাড়ি'}` : ''}
        </p>
      </div>

      {/* Responsive Properties Table */}
      {isLoading ? (
        <ResponsiveTableContainer>
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{isEn ? 'Property' : 'বাড়ি'}</TableHead>
                  <TableHead className="min-w-[220px]">{isEn ? 'Address' : 'ঠিকানা'}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.units}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.floor}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[160px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton columns={6} rows={5} />
              </TableBody>
            </Table>
          </div>
          <div className="block md:hidden">
            <MobileTableSkeleton rows={5} />
          </div>
        </ResponsiveTableContainer>
      ) : properties && properties.length > 0 ? (
        <ResponsiveTableContainer>
          {/* Desktop Tabular View */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{isEn ? 'Property' : 'বাড়ি'}</TableHead>
                  <TableHead className="min-w-[220px]">{isEn ? 'Address' : 'ঠিকানা'}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.units}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.floor}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[160px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const unitCount = property._count?.units || 0;
                  return (
                    <TableRow key={property.id}>
                      <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F3EF] text-[#059669]">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 max-w-[170px]">
                            <p className="truncate font-medium text-[#0F172A] text-sm" title={property.name}>
                              {property.name}
                            </p>
                            {property.description && (
                              <p className="truncate text-xs text-[#64748B]" title={property.description}>
                                {property.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
                          <span className="truncate max-w-[200px]" title={`${property.address}${property.city ? `, ${property.city}` : ''}`}>
                            {property.address}{property.city ? `, ${property.city}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell align="right" className="tabular-nums font-medium text-[#334155]">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <Home className="h-3.5 w-3.5 text-[#94A3B8]" />
                          {unitCount}
                        </span>
                      </TableCell>
                      <TableCell align="right" className="tabular-nums text-[#64748B]">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <Layers className="h-3.5 w-3.5 text-[#94A3B8]" />
                          {property.totalFloors}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                          {isEn ? 'Active' : 'সক্রিয়'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(property)}
                            className="h-8 w-8 text-[#64748B] hover:text-[#0F172A]"
                            title={t.edit}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(property.id, property.name)}
                            className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]"
                            title={t.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Link href={`/properties/${property.id}`}>
                            <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs px-2.5">
                              {isEn ? 'Units' : 'ইউনিট'} <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile 2-Line Rows */}
          <div className="block md:hidden divide-y divide-[#F1F5F9]">
            {properties.map((property) => {
              const unitCount = property._count?.units || 0;
              return (
                <MobileDataRow
                  key={property.id}
                  onClick={() => setDetailProperty(property)}
                  showChevron
                  identity={
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E8F3EF] text-[#059669]">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate font-semibold text-sm text-[#0F172A]">
                        {property.name}
                      </span>
                    </div>
                  }
                  value={`${unitCount} ${isEn ? (unitCount === 1 ? 'Unit' : 'Units') : 'টি ইউনিট'}`}
                  stateAndDetail={
                    <>
                      <CompactStatus label={isEn ? 'Active' : 'সক্রিয়'} variant="success" />
                      <span className="text-slate-300">·</span>
                      <span className="truncate max-w-[140px]">
                        {property.address}{property.city ? `, ${property.city}` : ''}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{property.totalFloors} {isEn ? 'Floors' : 'তলা'}</span>
                    </>
                  }
                  action={
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/properties/${property.id}`}>
                        <Button size="sm" variant="outline" className="h-8 min-h-[38px] px-2.5 text-xs gap-1 border-[#E2E8F0]">
                          <span>{isEn ? 'Units' : 'ইউনিট'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
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
              icon={Building2}
              title={t.noPropertiesFound}
              description={t.addFirstProperty}
              actionLabel={t.addNewProperty}
              onAction={handleCreate}
            />
          </CardContent>
        </Card>
      )}

      {/* Row Details Bottom Sheet on Mobile */}
      <BottomSheet open={!!detailProperty} onOpenChange={(open) => !open && setDetailProperty(null)}>
        {detailProperty && (
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>{detailProperty.name}</BottomSheetTitle>
              <BottomSheetDescription>
                {detailProperty.address}{detailProperty.city ? `, ${detailProperty.city}` : ''}
              </BottomSheetDescription>
            </BottomSheetHeader>

            <div className="py-2">
              <DetailItem
                label={isEn ? 'Total Units' : 'মোট ইউনিট'}
                value={detailProperty._count?.units || 0}
                isNumeric
                highlight
              />
              <DetailItem
                label={isEn ? 'Total Floors' : 'মোট তলা'}
                value={detailProperty.totalFloors}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Address' : 'ঠিকানা'}
                value={detailProperty.address}
              />
              {detailProperty.city && (
                <DetailItem
                  label={isEn ? 'City' : 'শহর'}
                  value={detailProperty.city}
                />
              )}
              {detailProperty.description && (
                <DetailItem
                  label={isEn ? 'Description' : 'বিবরণ'}
                  value={detailProperty.description}
                />
              )}
              <DetailItem
                label={isEn ? 'Status' : 'অবস্থা'}
                value={
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                    {isEn ? 'Active' : 'সক্রিয়'}
                  </span>
                }
              />
            </div>

            <BottomSheetFooter>
              <Link href={`/properties/${detailProperty.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] min-h-[44px]">
                  <Home className="w-4 h-4 mr-2" />
                  {isEn ? 'Manage Units' : 'ইউনিট পরিচালনা করুন'}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  const p = detailProperty;
                  setDetailProperty(null);
                  handleEdit(p);
                }}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const id = detailProperty.id;
                  const name = detailProperty.name;
                  setDetailProperty(null);
                  handleDelete(id, name);
                }}
                className="w-full sm:w-auto min-h-[44px] text-[#DC2626] hover:bg-[#FEF2F2] border-[#FCA5A5]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.delete}
              </Button>
            </BottomSheetFooter>
          </BottomSheetContent>
        )}
      </BottomSheet>

      <PropertyFormDialog property={editingProperty} open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} onSuccess={refetch} />
    </div>
  );
}