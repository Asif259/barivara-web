'use client';

import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from './button';
import { FileCategory, Media } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/api';
import { uploadFileDirectly, getFileDownloadUrl, deleteFileRecord } from '@/lib/file-upload';
import { useLanguageStore } from '@/stores/language-store';
import { toast } from 'sonner';
import { ImagePreviewDialog } from './image-preview-dialog';

export interface FileUploaderProps {
  category: FileCategory;
  entityType?: string;
  entityId?: string;
  value?: string | null; // existing fileId
  onChange?: (fileId: string | null, media?: Media | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUploader({
  category,
  entityType,
  entityId,
  value,
  onChange,
  accept,
  maxSizeMB = 5,
  label,
  description,
  disabled = false,
  className = '',
}: FileUploaderProps) {
  const { language } = useLanguageStore();
  const isEn = language === 'en';

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size?: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageCategory = ['PROFILE_IMAGE', 'PROPERTY_IMAGE', 'TENANT_PROFILE_PICTURE', 'TENANT_FRONT_NID', 'TENANT_BACK_NID', 'PAYMENT_RECEIPT', 'OWNER_SIGNATURE'].includes(category);
  const defaultAccept = isImageCategory
    ? 'image/jpeg,image/png,image/webp'
    : 'application/pdf,image/jpeg,image/png,image/webp';

  const effectiveFileId = value ?? fileId;
  const { data: remotePreviewUrl } = useQuery({
    queryKey: ['file-download-url', effectiveFileId],
    queryFn: () => getFileDownloadUrl(effectiveFileId as string),
    enabled: !!effectiveFileId,
  });
  const displayPreviewUrl = previewUrl || remotePreviewUrl;

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return isEn
        ? `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum allowed ${maxSizeMB}MB`
        : `ফাইলের সাইজ (${(file.size / 1024 / 1024).toFixed(1)}MB) অনুমোদিত সর্বোচ্চ ${maxSizeMB}MB অতিক্রম করেছে`;
    }

    const acceptedTypes = (accept || defaultAccept).split(',').map((t) => t.trim().toLowerCase());
    const fileType = (file.type || '').toLowerCase();
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;

    const isMatch = acceptedTypes.some((type) => {
      if (type.startsWith('.')) return type === fileExt;
      if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
      return type === fileType;
    });

    if (!isMatch && fileType) {
      return isEn
        ? `Invalid file format (${file.type}). Allowed: ${accept || defaultAccept}`
        : `অননুমোদিত ফাইল ফরম্যাট। অনুমোদিত ফরম্যাট: ${accept || defaultAccept}`;
    }

    return null;
  };

  const handleUpload = async (file: File) => {
    const errorMsg = validateFile(file);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    // Generate local preview immediately if it's an image
    if (file.type.startsWith('image/')) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    }

    setFileInfo({ name: file.name, size: file.size });
    setIsUploading(true);
    setProgress(0);

    try {
      const media = await uploadFileDirectly({
        file,
        category,
        entityType,
        entityId,
        onProgress: (p) => setProgress(p),
      });

      setFileId(media.id);
      onChange?.(media.id, media);

      toast.success(
        isEn
          ? 'File uploaded successfully!'
          : 'ফাইল সফলভাবে আপলোড সম্পন্ন হয়েছে!'
      );
    } catch (err: unknown) {
      console.error('File upload failed:', err);
      setPreviewUrl(null);
      setFileInfo(null);
      toast.error(
        getApiErrorMessage(err, isEn ? 'Failed to upload file' : 'ফাইল আপলোড ব্যর্থ হয়েছে')
      );
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!effectiveFileId || disabled || isUploading) return;

    const currentId = effectiveFileId;
    setFileId(null);
    setPreviewUrl(null);
    setFileInfo(null);
    onChange?.(null, null);

    try {
      await deleteFileRecord(currentId);
      toast.success(isEn ? 'File removed' : 'ফাইলটি মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error('Failed to delete file from backend:', err);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 block">
          {label}
        </label>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || defaultAccept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleFileSelect}
      />

      {/* Active File Preview Card */}
      {effectiveFileId && !isUploading ? (
        <div className="relative group rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Thumbnail / Icon */}
              {displayPreviewUrl && isImageCategory ? (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayPreviewUrl}
                    alt={fileInfo?.name || 'Uploaded File'}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
                  <FileText className="h-6 w-6" />
                </div>
              )}

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {fileInfo?.name || (isEn ? 'File Uploaded' : 'ফাইল আপলোড সম্পন্ন')}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  ID: #{effectiveFileId.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {displayPreviewUrl && isImageCategory && (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title={isEn ? 'Preview' : 'প্রিভিউ'}
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              {displayPreviewUrl && !isImageCategory && (
                <a
                  href={displayPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title={isEn ? 'View / Download' : 'দেখুন / ডাউনলোড করুন'}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title={isEn ? 'Remove File' : 'ফাইল মুছুন'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Area */
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all cursor-pointer
            ${isDragging ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-400'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${isUploading ? 'cursor-wait bg-white border-emerald-300' : ''}
          `}
        >
          {isUploading ? (
            /* Uploading State */
            <div className="w-full space-y-3 py-2">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs font-semibold">
                  {isEn ? 'Uploading directly to secure storage...' : 'স্টোরেজে সরাসরি আপলোড হচ্ছে...'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono text-center">
                {progress}%
              </p>
            </div>
          ) : (
            /* Idle State */
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs text-emerald-600 border border-slate-200 mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {isEn ? 'Click to upload' : 'ফাইল নির্বাচন করতে ক্লিক করুন'}{' '}
                <span className="font-normal text-slate-500">
                  {isEn ? 'or drag and drop' : 'অথবা ড্র্যাগ করে আনুন'}
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {isImageCategory
                  ? isEn
                    ? `JPEG, PNG, WebP (Max ${maxSizeMB}MB)`
                    : `জেপিজি, পিএনজি, ওয়েবপি (সর্বোচ্চ ${maxSizeMB}MB)`
                  : isEn
                    ? `PDF, Images (Max ${maxSizeMB}MB)`
                    : `পিডিএফ, ছবি (সর্বোচ্চ ${maxSizeMB}MB)`}
              </p>
            </>
          )}
        </div>
      )}

      {description && !effectiveFileId && (
        <p className="text-[11px] text-slate-500">{description}</p>
      )}

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        imageUrl={displayPreviewUrl || null}
        title={fileInfo?.name || (isEn ? 'File Preview' : 'ফাইল প্রিভিউ')}
      />
    </div>
  );
}
