'use client';

import { useQuery } from '@tanstack/react-query';
import { getFileDownloadUrl } from '@/lib/file-upload';

export function useFileDownloadUrl(mediaId: string | undefined | null) {
  return useQuery({
    queryKey: ['file-download-url', mediaId],
    queryFn: () => getFileDownloadUrl(mediaId!),
    enabled: !!mediaId,
    staleTime: 50 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}