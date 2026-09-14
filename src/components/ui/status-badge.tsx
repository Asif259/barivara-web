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
    case 'PAID':
    return (
        <Badge variant="default">
          <CheckCircle2 className="h-3 w-3 text-[#15803D]" />
          {isEn ? 'Paid' : 'পরিশোধিত'}
        </Badge>
      );
    case 'PARTIAL':
      return (
        <Badge variant="warning">
          <Clock className="h-3 w-3 text-[#B45309]" />
          {isEn ? 'Partial' : 'আংশিক পরিশোধ'}
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 text-[#6B7280]" />
          {isEn ? 'Pending' : 'অপেক্ষমান'}
        </Badge>
      );
    case 'OVERDUE':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 text-[#DC2626]" />
          {isEn ? 'Overdue' : 'মেয়াদোত্তীর্ণ'}
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="outline">
          <XCircle className="h-3 w-3 text-[#9CA3AF]" />
          {isEn ? 'Cancelled' : 'বাতিল'}
        </Badge>
      );
    case 'VACANT':
      return (
        <Badge variant="info">
          <Home className="h-3 w-3 text-[#2563EB]" />
          {isEn ? 'Vacant' : 'খালি'}
        </Badge>
      );
    case 'OCCUPIED':
      return (
        <Badge variant="default">
          <CheckCircle2 className="h-3 w-3 text-[#15803D]" />
          {isEn ? 'Occupied' : 'ভাড়া দেওয়া'}
        </Badge>
      );
    case 'MAINTENANCE':
      return (
        <Badge variant="warning">
          <ShieldAlert className="h-3 w-3 text-[#B45309]" />
          {isEn ? 'Maintenance' : 'মেরামত'}
        </Badge>
      );
    case 'ACTIVE':
      return (
        <Badge variant="default">
          <CheckCircle2 className="h-3 w-3 text-[#15803D]" />
          {isEn ? 'Active' : 'সক্রিয়'}
        </Badge>
      );
    case 'ENDED':
      return <Badge variant="secondary">{isEn ? 'Ended' : 'সমাপ্ত'}</Badge>;
    case 'COMPLETED':
      return (
        <Badge variant="default">
          <CheckCircle2 className="h-3 w-3 text-[#15803D]" />
          {isEn ? 'Completed' : 'সম্পন্ন'}
        </Badge>
      );
    case 'REVERSED':
      return (
        <Badge variant="destructive" className="line-through">
          <XCircle className="h-3 w-3 text-[#DC2626]" />
          {isEn ? 'Reversed' : 'রিভার্সড (বাতিল)'}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
