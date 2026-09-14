'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { propertiesApi, unitsApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Unit } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { UnitFormDialog } from '@/components/units/unit-form-dialog';
import { BulkUnitFormDialog } from '@/components/units/bulk-unit-form-dialog';
import { PropertyFormDialog } from '@/components/properties/property-form-dialog';
import { Building2, ArrowLeft, Plus, Home, MapPin, Edit, Trash2, Layers } from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [bulkUnitDialogOpen, setBulkUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [propertyEditOpen, setPropertyEditOpen] = useState(false);

  // 1. Fetch Property Details
  const {
    data: property,
    isLoading: isPropLoading,
    refetch: refetchProperty,
  } = useQuery({
    queryKey: ['property-details', propertyId],
    queryFn: async () => {
      const res = await propertiesApi.get(propertyId);
      return res.data?.data;
    },
    enabled: !!propertyId,
  });

  // 2. Fetch Property Financial & Units Summary
  const {
    data: summary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['property-summary', propertyId],
    queryFn: async () => {
      const res = await propertiesApi.getSummary(propertyId);
      return res.data?.data;
    },
    enabled: !!propertyId,
  });

  // 3. Fetch Units for this property
  const {
    data: units,
    isLoading: isUnitsLoading,
    refetch: refetchUnits,
  } = useQuery({
    queryKey: ['property-units', propertyId],
    queryFn: async () => {
      const res = await unitsApi.listByProperty(propertyId);
      return res.data?.data || [];
    },
    enabled: !!propertyId,
  });

  const handleAddUnit = () => {
    setEditingUnit(null);
    setUnitDialogOpen(true);
  };

  const unitsByFloor = (units || []).reduce<Record<number, Unit[]>>((groups, unit) => {
    (groups[unit.floor] ||= []).push(unit);
    return groups;
  }, {});

  const handleEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setUnitDialogOpen(true);
  };

  const refreshUnitViews = () => {
    refetchUnits();
    refetchProperty();
    refetchSummary();
  };

  const handleDeleteUnit = async (unitId: string, unitNumber: string) => {
    if (!confirm(isEn ? `Delete unit "${unitNumber}"?` : `আপনি কি ইউনিট "${unitNumber}" মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await unitsApi.remove(unitId);
      toast.success(isEn ? 'Unit deleted successfully' : 'ইউনিট মুছে ফেলা হয়েছে');
      refreshUnitViews();
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || (isEn ? 'Failed to delete unit' : 'ইউনিট মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  if (isPropLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-[10px]" />
        <Skeleton className="h-80 w-full rounded-[10px]" />
      </div>
    );
  }

  if (!property) {
    return (
      <EmptyState
        icon={Building2}
        title={t.noPropertiesFound}
        actionLabel={isEn ? 'Back to Properties' : 'সকল বাড়িতে ফিরে যান'}
        onAction={() => router.push('/properties')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-5 border-b border-[#E5E7EB] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/properties">
            <Button variant="outline" size="icon" className="mt-1 h-9 w-9 shrink-0" title={isEn ? 'Back to properties' : 'সকল বাড়িতে ফিরে যান'}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6B7280]">{isEn ? 'Property' : 'বাড়ি'}</p>
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-[#171717]">{property.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6B7280]"><MapPin className="h-4 w-4 text-[#9CA3AF]" />{property.address}{property.city ? `, ${property.city}` : ''}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setPropertyEditOpen(true)} className="gap-1.5 h-10"><Edit className="h-3.5 w-3.5" />{t.edit}</Button>
          <Button onClick={handleAddUnit} size="sm" className="gap-1.5 h-10"><Plus className="h-4 w-4" />{t.addNewUnit}</Button>
          <Button onClick={() => setBulkUnitDialogOpen(true)} variant="outline" size="sm" className="gap-1.5 h-10"><Layers className="h-4 w-4" />{t.addUnitsByFloor}</Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 divide-x divide-y divide-[#E5E7EB] rounded-[10px] border border-[#E5E7EB] bg-white sm:grid-cols-4 sm:divide-y-0">
          <SummaryMetric label={`${t.total} ${t.units}`} value={summary.totalUnits} detail={`${summary.occupiedUnits} ${t.occupied} · ${summary.vacantUnits} ${t.vacant}`} />
          <SummaryMetric label={t.activeAgreement} value={summary.activeTenants} detail={t.tenants} />
          <SummaryMetric label={isEn ? 'Monthly expected' : 'মাসিক প্রত্যাশিত'} value={formatCurrency(summary.currentMonth.expected, language)} detail={`${t.paid}: ${formatCurrency(summary.currentMonth.collected, language)}`} accent />
          <SummaryMetric label={t.collectionRate} value={`${summary.currentMonth.collectionRate}%`} detail={`${t.remaining}: ${formatCurrency(summary.currentMonth.outstanding, language)}`} accent={summary.currentMonth.collectionRate > 0} />
        </div>
      )}

      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardHeader className="flex flex-col gap-3 border-b border-[#F3F4F6] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Home className="h-4 w-4 text-[#307473]" /><CardTitle className="text-[17px]">{isEn ? 'Units' : 'ইউনিট'}</CardTitle></div>
            <CardDescription className="mt-1">{isEn ? 'Units, occupancy, and rent settings for this property.' : 'এই বাড়ির ইউনিট, দখল এবং ভাড়ার তথ্য।'}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddUnit} variant="outline" size="sm" className="h-9 gap-1.5"><Plus className="h-3.5 w-3.5" />{t.addNewUnit}</Button>
            <Button onClick={() => setBulkUnitDialogOpen(true)} variant="outline" size="sm" className="h-9 gap-1.5"><Layers className="h-3.5 w-3.5" />{t.addByFloor}</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          {isUnitsLoading ? (
            <div className="space-y-3 p-5"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : units && units.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[130px]">{t.unitNumber}</TableHead>
                  <TableHead className="w-[100px]">{t.floor}</TableHead>
                  <TableHead className="min-w-[130px]">{t.unitType}</TableHead>
                  <TableHead className="min-w-[130px]">{isEn ? 'Rooms' : 'রুম ও বাথ'}</TableHead>
                  <TableHead className="w-[140px]">{t.baseRent}</TableHead>
                  <TableHead className="w-[140px]">{t.serviceFee}</TableHead>
                  <TableHead className="w-[130px]">{t.status}</TableHead>
                  <TableHead className="w-[120px] text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(unitsByFloor).sort(([a], [b]) => Number(b) - Number(a)).flatMap(([floor, floorUnits]) => [
                  <TableRow key={`floor-${floor}`} className="bg-[#FAFAF9] hover:bg-[#FAFAF9] table-section-header">
                    <TableCell colSpan={8} className="py-2.5 text-xs font-medium text-[#6B7280]">
                      <span className="inline-flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-[#307473]" />{isEn ? `Floor ${floor}` : `${floor} তলা`}<span className="font-normal text-[#9CA3AF]">({floorUnits.length} {t.units})</span></span>
                    </TableCell>
                  </TableRow>,
                  ...floorUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell data-label={t.unitNumber} className="font-medium text-[#171717]">{unit.unitNumber}</TableCell>
                      <TableCell data-label={t.floor} className="text-[#6B7280]">{unit.floor} {isEn ? 'Floor' : 'তলা'}</TableCell>
                      <TableCell data-label={t.unitType} className="text-sm text-[#6B7280]">{unit.unitType}</TableCell>
                      <TableCell data-label={isEn ? 'Rooms' : 'রুম ও বাথ'} className="text-sm text-[#6B7280]">{unit.bedrooms || 0} Bed · {unit.bathrooms || 0} Bath</TableCell>
                      <TableCell data-label={t.baseRent} className="font-medium text-[#171717]">{formatCurrency(unit.monthlyBaseRent, language)}</TableCell>
                      <TableCell data-label={t.serviceFee} className="text-[#6B7280]">{formatCurrency(unit.defaultServiceFee, language)}</TableCell>
                      <TableCell data-label={t.status}><StatusBadge status={unit.status} lang={language} /></TableCell>
                      <TableCell data-label={t.actions} className="text-right"><div className="flex items-center justify-end gap-1 table-actions"><Button size="icon" variant="ghost" onClick={() => handleEditUnit(unit)} className="h-8 w-8 text-[#6B7280] hover:text-[#171717]" title={t.edit}><Edit className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" onClick={() => handleDeleteUnit(unit.id, unit.unitNumber)} className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]" title={t.delete}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                    </TableRow>
                  )),
                ])}
              </TableBody>
            </Table>
          ) : (
            <div className="p-5"><EmptyState icon={Home} title={isEn ? 'No units added' : 'কোনো ইউনিট নেই'} description={isEn ? 'Add your first flat or shop to this building' : 'এই বাড়ির জন্য ফ্ল্যাট বা দোকান যুক্ত করুন'} actionLabel={t.addNewUnit} onAction={handleAddUnit} /></div>
          )}
        </CardContent>
      </Card>

      <UnitFormDialog propertyId={propertyId} unit={editingUnit} open={unitDialogOpen} onOpenChange={setUnitDialogOpen} onSuccess={() => { refetchUnits(); refetchProperty(); refetchSummary(); }} />
      <BulkUnitFormDialog propertyId={propertyId} units={units || []} open={bulkUnitDialogOpen} onOpenChange={setBulkUnitDialogOpen} onSuccess={refreshUnitViews} />
      <PropertyFormDialog property={property} open={propertyEditOpen} onOpenChange={setPropertyEditOpen} onSuccess={refetchProperty} />
    </div>
  );
}

function SummaryMetric({ label, value, detail, accent = false }: { label: string; value: string | number; detail: string; accent?: boolean }) {
  return <div className="min-w-0 p-5"><p className="truncate text-[13px] font-medium text-[#6B7280]">{label}</p><p className={`mt-2 truncate text-xl font-semibold tracking-tight ${accent ? 'text-[#12664F]' : 'text-[#171717]'}`}>{value}</p><p className="mt-1 truncate text-xs text-[#6B7280]">{detail}</p></div>;
}