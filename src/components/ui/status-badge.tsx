import React from 'react';
import { Badge } from './badge';
import { UnitStatus, RentStatus, AgreementStatus, PaymentStatus } from '@/lib/types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Home, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: UnitStatus | RentStatus | AgreementStatus | PaymentStatus | string;
  lang?: 'bn' | 'en';
}

export function StatusBadge({ status, lang = 'bn' }: StatusBadgeProps) {
  const isEn = lang === 'en';

  switch (status) {
    // Rent Statuses
    case 'PAID':
      return (
        <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {isEn ? 'Paid' : 'পরিশোধিত'}
        </Badge>
      );
    case 'PARTIAL':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {isEn ? 'Partial' : 'আংশিক পরিশোধ'}
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
          <Clock className="w-3 h-3 text-slate-500" />
          {isEn ? 'Pending' : 'অপেক্ষমান'}
        </Badge>
      );
    case 'OVERDUE':
      return (
        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          {isEn ? 'Overdue' : 'মেয়াদোত্তীর্ণ'}
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
          <XCircle className="w-3 h-3 text-slate-400" />
          {isEn ? 'Cancelled' : 'বাতিল'}
        </Badge>
      );

    // Unit Statuses
    case 'VACANT':
      return (
        <Badge variant="info" className="bg-sky-50 text-sky-700 border-sky-200">
          <Home className="w-3 h-3 text-sky-600" />
          {isEn ? 'Vacant' : 'খালি'}
        </Badge>
      );
    case 'OCCUPIED':
      return (
        <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {isEn ? 'Occupied' : 'ভাড়া দেওয়া'}
        </Badge>
      );
    case 'MAINTENANCE':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          {isEn ? 'Maintenance' : 'মেরামত'}
        </Badge>
      );

    // Agreement Statuses
    case 'ACTIVE':
      return (
        <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {isEn ? 'Active' : 'সক্রিয়'}
        </Badge>
      );
    case 'ENDED':
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
          {isEn ? 'Ended' : 'সমাপ্ত'}
        </Badge>
      );

    // Payment Statuses
    case 'COMPLETED':
      return (
        <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {isEn ? 'Completed' : 'সম্পন্ন'}
        </Badge>
      );
    case 'REVERSED':
      return (
        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 line-through">
          <XCircle className="w-3 h-3 text-rose-600" />
          {isEn ? 'Reversed' : 'রিভার্সড (বাতিল)'}
        </Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
