'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Property, PropertySummary, Unit, ApiResponse } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { UnitFormDialog } from '@/components/units/unit-form-dialog';
import { PropertyFormDialog } from '@/components/properties/property-form-dialog';
import {
  Building2,
  ArrowLeft,
  Plus,
  Home,
  MapPin,
  Edit,
  Trash2,
  Bed,
  Bath,
  Layers,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
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
      const res = await apiClient.get<ApiResponse<Property>>(`/properties/${propertyId}`);
      return res.data?.data;
    },
    enabled: !!propertyId,
  });

  // 2. Fetch Property Financial & Units Summary
  const {
    data: summary,
    isLoading: isSummaryLoading,
  } = useQuery({
    queryKey: ['property-summary', propertyId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PropertySummary>>(`/properties/${propertyId}/summary`);
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
      const res = await apiClient.get<ApiResponse<Unit[]>>(`/properties/${propertyId}/units?limit=100`);
      return res.data?.data || [];
    },
    enabled: !!propertyId,
  });

  const handleAddUnit = () => {
    setEditingUnit(null);
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setUnitDialogOpen(true);
  };

  const handleDeleteUnit = async (unitId: string, unitNumber: string) => {
    if (!confirm(isEn ? `Delete unit "${unitNumber}"?` : `আপনি কি ইউনিট "${unitNumber}" মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await apiClient.delete(`/units/${unitId}`);
      toast.success(isEn ? 'Unit deleted successfully' : 'ইউনিট মুছে ফেলা হয়েছে');
      refetchUnits();
      refetchProperty();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEn ? 'Failed to delete unit' : 'ইউনিট মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  if (isPropLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
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
    <div className="space-y-6">
      {/* Top Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/properties">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{property.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {property.address} {property.city ? `, ${property.city}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPropertyEditOpen(true)} className="gap-1.5">
            <Edit className="w-3.5 h-3.5" />
            {t.edit}
          </Button>
          <Button onClick={handleAddUnit} variant="gradient" size="sm" className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" />
            {t.addNewUnit}
          </Button>
        </div>
      </div>

      {/* Property Overview Stats Strip */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/80">
            <p className="text-xs font-medium text-slate-500">{t.total} {t.units}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalUnits}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {summary.occupiedUnits} {t.occupied} &bull; {summary.vacantUnits} {t.vacant}
            </p>
          </Card>
          <Card className="p-4 border-slate-200/80">
            <p className="text-xs font-medium text-slate-500">{t.activeAgreement}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.activeTenants}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.tenants}</p>
          </Card>
          <Card className="p-4 border-slate-200/80">
            <p className="text-xs font-medium text-slate-500">{isEn ? 'Monthly Expected' : 'মাসিক প্রত্যাশিত'}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.currentMonth.expected, language)}</h3>
            <p className="text-xs text-emerald-600 mt-0.5 font-medium">{t.paid}: {formatCurrency(summary.currentMonth.collected, language)}</p>
          </Card>
          <Card className="p-4 border-slate-200/80">
            <p className="text-xs font-medium text-slate-500">{t.collectionRate}</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{summary.currentMonth.collectionRate}%</h3>
            <p className="text-xs text-rose-600 mt-0.5 font-medium">{t.remaining}: {formatCurrency(summary.currentMonth.outstanding, language)}</p>
          </Card>
        </div>
      )}

      {/* Units Table Card */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-600" />
              {isEn ? 'Flats and Units' : 'ফ্ল্যাট ও ইউনিটের তালিকা'}
            </CardTitle>
          </div>
          <Button onClick={handleAddUnit} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            {t.addNewUnit}
          </Button>
        </CardHeader>
        <CardContent>
          {isUnitsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : units && units.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.unitNumber}</TableHead>
                  <TableHead>{t.floor}</TableHead>
                  <TableHead>{t.unitType}</TableHead>
                  <TableHead>{isEn ? 'Rooms' : 'রুম ও বাথ'}</TableHead>
                  <TableHead>{t.baseRent}</TableHead>
                  <TableHead>{t.serviceFee}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-bold text-slate-900">
                      {unit.unitNumber}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {unit.floor} {isEn ? 'Floor' : 'তলা'}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">
                      {unit.unitType}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {unit.bedrooms || 0} Bed &bull; {unit.bathrooms || 0} Bath
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatCurrency(unit.monthlyBaseRent, language)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatCurrency(unit.defaultServiceFee, language)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={unit.status} lang={language} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditUnit(unit)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUnit(unit.id, unit.unitNumber)}
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
              icon={Home}
              title={isEn ? 'No Units Added' : 'কোনো ইউনিট নেই'}
              description={isEn ? 'Add your first flat or shop to this building' : 'এই বাড়ির জন্য ফ্ল্যাট বা দোকান যুক্ত করুন'}
              actionLabel={t.addNewUnit}
              onAction={handleAddUnit}
            />
          )}
        </CardContent>
      </Card>

      {/* Unit Add / Edit Dialog */}
      <UnitFormDialog
        propertyId={propertyId}
        unit={editingUnit}
        open={unitDialogOpen}
        onOpenChange={setUnitDialogOpen}
        onSuccess={() => {
          refetchUnits();
          refetchProperty();
        }}
      />

      {/* Property Edit Dialog */}
      <PropertyFormDialog
        property={property}
        open={propertyEditOpen}
        onOpenChange={setPropertyEditOpen}
        onSuccess={refetchProperty}
      />
    </div>
  );
}
