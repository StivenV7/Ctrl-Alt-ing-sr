
'use client';

import { BottomNavbar } from '@/components/BottomNavbar';
import { Header } from '@/components/Header';
import { SidebarHeader, SidebarNavContent } from '@/components/Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    // You can return a loader here, or null
    return null;
  }

  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r">
        <SidebarHeader />
        <SidebarNavContent />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:px-6 md:p-8 mb-16 md:mb-0">
          {children}
        </main>
        <div className="md:hidden">
          <BottomNavbar />
        </div>
      </div>
    </div>
  );
}
