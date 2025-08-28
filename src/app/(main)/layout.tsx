
'use client';

import { BottomNavbar } from '@/components/BottomNavbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
        <main className="p-4 sm:px-6 md:p-8 mb-20">
            {children}
        </main>
        <BottomNavbar />
    </>
  );
}
