'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAuthHydrated } from '@/stores/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const hasHydrated = useAuthHydrated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarFocused, setIsSidebarFocused] = useState(false);

  const isSidebarExpanded = isSidebarHovered || isSidebarFocused;

  useEffect(() => {
    // Only redirect once Zustand has finished rehydrating from localStorage.
    // Without this guard, on hard reload isAuthenticated starts as `false`
    // (the Zustand default) before localStorage is read, causing a false logout.
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show spinner while waiting for hydration OR while still authenticated check is pending
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#12664F] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
      {/* Desktop Floating/Expanding Sidebar */}
      <Sidebar
        className="hidden md:flex"
        isHovered={isSidebarHovered}
        isFocused={isSidebarFocused}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        onFocusCapture={() => setIsSidebarFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsSidebarFocused(false);
          }
        }}
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#171717]/40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex h-full">
            <Sidebar onClose={() => setMobileMenuOpen(false)} isMobile />
          </div>
        </div>
      )}

      {/* Main Content Area - receives margin-left matching sidebar expansion width */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out',
          isSidebarExpanded ? 'md:ml-[250px]' : 'md:ml-[68px]'
        )}
      >
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-7">
          <div className="max-w-8xl">{children}</div>
        </main>
      </div>
    </div>
  );
}