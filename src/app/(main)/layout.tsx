
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/icons';
import { RankDisplay } from '@/components/RankDisplay';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldAlert } from 'lucide-react';
import { RANKS } from '@/lib/constants';
import { useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect, useCallback } from 'react';
import { BottomNavbar } from '@/components/BottomNavbar';
import { ForumSidebar } from '@/components/forum/ForumSidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut, isAdmin } = useAuth();
  const [userXp, setUserXp] = useState(0);
  const [userName, setUserName] = useState('');
  const pathname = usePathname();

  const userRef = useMemo(() => (user ? doc(db, 'users', user.uid) : null), [user]);

  const isForumPage = pathname.startsWith('/forum');
  const isSettingsPage = pathname.startsWith('/settings');

  const loadUserData = useCallback(async () => {
    if (!userRef) return;
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserXp(data.xp || 0);
      setUserName(data.displayName || user?.displayName || 'Usuario');
    }
  }, [userRef, user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find((rank) => userXp >= rank.minXp) ?? RANKS[0];
  }, [userXp]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">Habitica</h1>
          </div>
          <div className="flex-1 items-center justify-end space-x-4 hidden md:flex">
             {user && (
                <>
                    <RankDisplay rank={currentRank} xp={userXp} displayName={userName} />
                    {isAdmin && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={signOut} title="Cerrar sesión">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className={(isForumPage || isSettingsPage) ? "grid md:grid-cols-12 gap-8" : ""}>
          {(isForumPage || isSettingsPage) && (
            <div className="hidden md:block md:col-span-3">
              <ForumSidebar />
            </div>
          )}
          <main className={(isForumPage || isSettingsPage) ? "md:col-span-9" : "w-full"}>
              {children}
          </main>
        </div>
      </div>
      
      <div className="h-16 md:hidden" />
      <BottomNavbar rank={currentRank} xp={userXp} displayName={userName} onSignOut={signOut} />
    </div>
  );
}
