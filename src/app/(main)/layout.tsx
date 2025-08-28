
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect, useCallback } from 'react';
import { BottomNavbar } from '@/components/BottomNavbar';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarNavContent } from '@/components/Sidebar';
import { Logo } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';


const MobileHeader = () => {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <div className="flex items-center gap-2">
            <Logo className="size-7 text-primary" />
            <span className="text-lg font-bold text-primary">Habitica</span>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <button className="p-2 -mr-2">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Abrir menú</span>
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <SheetHeader className="p-3 border-b">
                      <SheetTitle className="flex items-center gap-2">
                          <Logo className="size-8 text-primary" />
                          <span className="text-xl font-bold text-primary">Habitica</span>
                      </SheetTitle>
                    </SheetHeader>
                    <SidebarNavContent />
                </SheetContent>
            </Sheet>
        </header>
    );
};


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
        <Sidebar className='hidden md:flex'>
             <SidebarNavContent />
        </Sidebar>
        <SidebarInset>
            <MobileHeader />
            <main className="p-4 sm:px-6 sm:py-0 md:p-8">
                {children}
            </main>
        </SidebarInset>
        <BottomNavbar />
    </SidebarProvider>
  );
}
