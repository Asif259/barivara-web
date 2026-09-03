import { apiClient } from './api';
import {
  ApiResponse,
  FileCategory,
  Media,
  UploadUrlResponse,
  FileDownloadUrlResponse,
} from './types';

export interface DirectUploadOptions {
  file: File;
  category: FileCategory;
  entityType?: string;
  entityId?: string;
  onProgress?: (percentage: number) => void;
}

/**
 * Uploads a file directly to Supabase Storage using backend-generated signed URLs.
 * 
 * Sequence:
 * 1. POST /files/upload-url (Backend validates MIME, size, derives bucket & returns signed URL)
 * 2. PUT {uploadUrl} (Client uploads binary directly to Supabase Storage)
 * 3. POST /files/{fileId}/complete (Backend verifies object existence in storage and marks COMPLETED)
 */
export async function uploadFileDirectly({
  file,
  category,
  entityType,
  entityId,
  onProgress,
}: DirectUploadOptions): Promise<Media> {
  // Step 1: Request Signed Upload URL from Backend
  onProgress?.(10);
  const uploadUrlRes = await apiClient.post<ApiResponse<UploadUrlResponse>>(
    '/files/upload-url',
    {
      category,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      entityType,
      entityId,
    }
  );

  const { fileId, uploadUrl } = uploadUrlRes.data.data;
  onProgress?.(30);

  // Step 2: Upload Binary Directly to Supabase Storage (bypasses application server)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text().catch(() => '');
    throw new Error(
      `Direct upload to storage failed with status ${uploadRes.status}: ${errorText}`
    );
  }

  onProgress?.(80);

  // Step 3: Complete & Verify Upload on Backend
  const completeRes = await apiClient.post<ApiResponse<Media>>(
    `/files/${fileId}/complete`
  );

  onProgress?.(100);
  return completeRes.data.data;
}

/**
 * Fetches the temporary signed download URL (for private files) or public URL (for public files)
 */
export async function getFileDownloadUrl(fileId: string): Promise<string> {
  const res = await apiClient.get<ApiResponse<FileDownloadUrlResponse>>(
    `/files/${fileId}/url`
  );
  return res.data.data.url;
}

/**
 * Deletes a file record and removes it from storage
 */
export async function deleteFileRecord(fileId: string): Promise<void> {
  await apiClient.delete(`/files/${fileId}`);
}
