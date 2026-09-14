'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Copy, Layers, Loader2, Save } from 'lucide-react';
import { unitsApi } from '@/lib/api';
import { BulkUnitInput, Unit, UnitType } from '@/lib/types';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type NamingPattern = 'LETTER' | 'NUMERIC';

const unitTypes: { value: UnitType; labelBn: string; labelEn: string }[] = [
  { value: 'APARTMENT', labelBn: 'অ্যাপার্টমেন্ট', labelEn: 'Apartment' },
  { value: 'FLAT', labelBn: 'ফ্ল্যাট', labelEn: 'Flat' },
  { value: 'ROOM', labelBn: 'রুম', labelEn: 'Room' },
  { value: 'SHOP', labelBn: 'দোকান', labelEn: 'Shop' },
  { value: 'OFFICE', labelBn: 'অফিস', labelEn: 'Office' },
  { value: 'PARKING', labelBn: 'পার্কিং', labelEn: 'Parking' },
  { value: 'OTHER', labelBn: 'অন্যান্য', labelEn: 'Other' },
];

const DEFAULTS: Omit<BulkUnitInput, 'unitNumber'> = {
  unitType: 'APARTMENT', bedrooms: 3, bathrooms: 2, monthlyBaseRent: 15000,
  defaultServiceFee: 2000, defaultParkingFee: 0, defaultExtraCharge: 0,
};

export function generateUnitNumbers(floor: number, count: number, pattern: NamingPattern) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    if (pattern === 'NUMERIC') return `${floor}${String(index + 1).padStart(2, '0')}`;
    return `${floor}${String.fromCharCode(65 + index)}`;
  });
}

interface BulkUnitFormDialogProps {
  propertyId: string;
  units: Unit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkUnitFormDialog({ propertyId, units: existingUnits, open, onOpenChange, onSuccess }: BulkUnitFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [floor, setFloor] = useState(1);
  const [count, setCount] = useState(4);
  const [pattern, setPattern] = useState<NamingPattern>('LETTER');
  const [defaults, setDefaults] = useState(DEFAULTS);
  const [unitNumbers, setUnitNumbers] = useState<string[]>(generateUnitNumbers(1, 4, 'LETTER'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regenerate = (nextFloor: number, nextCount: number, nextPattern: NamingPattern) => {
    setUnitNumbers(generateUnitNumbers(nextFloor, nextCount, nextPattern));
  };

  const normalizedNumbers = unitNumbers.map((number) => number.trim().toLocaleLowerCase());
  const duplicateNumbers = normalizedNumbers.filter((number, index) => number && normalizedNumbers.indexOf(number) !== index);
  const existingNumbers = new Set(existingUnits.map((unit) => unit.unitNumber.trim().toLocaleLowerCase()));
  const conflictingNumbers = normalizedNumbers.filter((number) => number && existingNumbers.has(number));
  const hasInvalidNumbers = unitNumbers.some((number) => !number.trim()) || duplicateNumbers.length > 0 || conflictingNumbers.length > 0;

  const summary = useMemo(
    () => isEn ? `You are about to create ${unitNumbers.length} units on Floor ${floor}.` : `আপনি তলা ${floor}-এ ${unitNumbers.length}টি ইউনিট তৈরি করতে যাচ্ছেন।`,
    [floor, isEn, unitNumbers.length],
  );

  const updateDefault = (field: keyof typeof DEFAULTS, value: string) => {
    setDefaults((current) => ({ ...current, [field]: field === 'unitType' ? value as UnitType : Number(value) }));
  };

  const copyPreviousFloor = () => {
    const previousUnits = existingUnits.filter((unit) => unit.floor === floor - 1);
    if (!previousUnits.length) {
      toast.error(isEn ? 'No units found on the previous floor.' : 'আগের তলায় কোনো ইউনিট পাওয়া যায়নি।');
      return;
    }
    const first = previousUnits[0];
    const nextPattern: NamingPattern = previousUnits.every((unit) => /^\d+$/.test(unit.unitNumber)) ? 'NUMERIC' : 'LETTER';
    setCount(previousUnits.length);
    setPattern(nextPattern);
    setDefaults({
      unitType: first.unitType,
      bedrooms: first.bedrooms ?? 0,
      bathrooms: first.bathrooms ?? 0,
      monthlyBaseRent: first.monthlyBaseRent,
      defaultServiceFee: first.defaultServiceFee,
      defaultParkingFee: first.defaultParkingFee,
      defaultExtraCharge: first.defaultExtraCharge,
    });
    regenerate(floor, previousUnits.length, nextPattern);
  };

  const submit = async () => {
    if (hasInvalidNumbers) {
      toast.error(isEn ? 'Resolve duplicate, existing, or blank unit numbers first.' : 'ডুপ্লিকেট, বিদ্যমান অথবা খালি ইউনিট নম্বর ঠিক করুন।');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await unitsApi.bulkCreate(propertyId, {
        floor,
        units: unitNumbers.map((unitNumber) => ({ ...defaults, unitNumber: unitNumber.trim() })),
      });
      toast.success(response.data.message || (isEn ? `${unitNumbers.length} units created successfully.` : `${unitNumbers.length}টি ইউনিট সফলভাবে তৈরি হয়েছে।`));
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || (isEn ? 'Could not create units.' : 'ইউনিট তৈরি করা সম্ভব হয়নি।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-600" />{isEn ? 'Add Units by Floor' : 'তলা অনুযায়ী ইউনিট যোগ করুন'}</DialogTitle>
          <DialogDescription>{isEn ? 'Set common defaults, then review and edit each generated unit number.' : 'একই তথ্য দিয়ে ইউনিট তৈরি করুন, তারপর প্রতিটি নম্বর যাচাই বা এডিট করুন।'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2"><Label htmlFor="bulk-floor">{t.floor}</Label><Input id="bulk-floor" min="0" type="number" value={floor} onChange={(e) => { const value = Math.max(0, Number(e.target.value)); setFloor(value); regenerate(value, count, pattern); }} /></div>
            <div className="space-y-2"><Label htmlFor="bulk-count">{t.numberOfUnits}</Label><Input id="bulk-count" min="1" max="100" type="number" value={count} onChange={(e) => { const value = Math.min(100, Math.max(1, Number(e.target.value))); setCount(value); regenerate(floor, value, pattern); }} /></div>
            <div className="space-y-2"><Label htmlFor="bulk-pattern">{t.namingPattern}</Label><select id="bulk-pattern" value={pattern} onChange={(e) => { const value = e.target.value as NamingPattern; setPattern(value); regenerate(floor, count, value); }} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="LETTER">{isEn ? 'Letters (4A, 4B)' : 'অক্ষর (4A, 4B)'}</option><option value="NUMERIC">{isEn ? 'Numeric (401, 402)' : 'সংখ্যা (401, 402)'}</option></select></div>
          </div>

          <div className="flex justify-end"><Button type="button" variant="outline" size="sm" onClick={copyPreviousFloor} className="gap-1.5"><Copy className="h-3.5 w-3.5" />{t.copyPreviousFloor}</Button></div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-2"><Label>{t.unitType}</Label><select value={defaults.unitType} onChange={(e) => updateDefault('unitType', e.target.value)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{unitTypes.map((type) => <option key={type.value} value={type.value}>{isEn ? type.labelEn : type.labelBn}</option>)}</select></div>
            <div className="space-y-2"><Label>{t.bedrooms}</Label><Input min="0" type="number" value={defaults.bedrooms} onChange={(e) => updateDefault('bedrooms', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t.bathrooms}</Label><Input min="0" type="number" value={defaults.bathrooms} onChange={(e) => updateDefault('bathrooms', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t.baseRent} (৳)</Label><Input min="0" type="number" value={defaults.monthlyBaseRent} onChange={(e) => updateDefault('monthlyBaseRent', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t.serviceFee} (৳)</Label><Input min="0" type="number" value={defaults.defaultServiceFee} onChange={(e) => updateDefault('defaultServiceFee', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t.parkingFee} (৳)</Label><Input min="0" type="number" value={defaults.defaultParkingFee} onChange={(e) => updateDefault('defaultParkingFee', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t.extraCharge} (৳)</Label><Input min="0" type="number" value={defaults.defaultExtraCharge} onChange={(e) => updateDefault('defaultExtraCharge', e.target.value)} /></div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{t.livePreview}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {unitNumbers.map((number, index) => <Input key={index} aria-label={`${isEn ? 'Unit number' : 'ইউনিট নম্বর'} ${index + 1}`} value={number} onChange={(e) => setUnitNumbers((current) => current.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} className={hasInvalidNumbers && (!number.trim() || normalizedNumbers.indexOf(normalizedNumbers[index]) !== index || existingNumbers.has(normalizedNumbers[index])) ? 'border-rose-400 focus-visible:ring-rose-400' : ''} />)}
            </div>
            {duplicateNumbers.length > 0 && <p className="mt-2 text-xs text-rose-600">{isEn ? 'Duplicate unit numbers are not allowed.' : 'একই ইউনিট নম্বর একাধিকবার ব্যবহার করা যাবে না।'}</p>}
            {conflictingNumbers.length > 0 && <p className="mt-2 text-xs text-rose-600">{isEn ? `Already exists: ${[...new Set(conflictingNumbers)].join(', ')}` : `ইতিমধ্যে রয়েছে: ${[...new Set(conflictingNumbers)].join(', ')}`}</p>}
          </div>

          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{summary}</p>
        </div>
        <DialogFooter><Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>{t.cancel}</Button><Button type="button" variant="gradient" disabled={isSubmitting || hasInvalidNumbers} onClick={submit} className="gap-2">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />{t.loading}</> : <><Save className="h-4 w-4" />{t.createUnits}</>}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}