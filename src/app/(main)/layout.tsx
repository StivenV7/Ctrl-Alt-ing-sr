
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect, useCallback } from 'react';
import { BottomNavbar } from '@/components/BottomNavbar';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Logo } from '@/components/icons';


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isForumPage = pathname.startsWith('/forum');
  const isSettingsPage = pathname.startsWith('/settings');

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
                 <div className="flex items-center gap-2">
                    <Logo className="size-7 text-primary" />
                    <span className="text-lg font-bold text-primary">Habitica</span>
                 </div>
                <SidebarTrigger />
            </header>
            <main className="p-4 sm:px-6 sm:py-0 md:p-8">
              {children}
            </main>
        </SidebarInset>
        <BottomNavbar />
    </SidebarProvider>
  );
}

