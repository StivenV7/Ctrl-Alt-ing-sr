
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessagesSquare, User, LogOut, ShieldAlert, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMemo } from 'react';
import { RANKS } from '@/lib/constants';
import { Logo } from './icons';
import { SidebarNavContent } from './Sidebar';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/fanpage', label: 'Fan Page', icon: Heart },
  { href: '/forum', label: 'Foro', icon: MessagesSquare },
];

function ProfileSheetContent() {
  const pathname = usePathname();
  const { user, signOut, isAdmin, userDoc } = useAuth();
  const displayName = userDoc?.data()?.displayName || user?.displayName || 'Usuario';
  const userXp = userDoc?.data()?.xp || 0;

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(rank => userXp >= rank.minXp) ?? RANKS[0];
  }, [userXp]);

  return (
    <div className="flex flex-col p-4">
        <SheetHeader className="pb-4 border-b text-left">
            <SheetTitle>
                <div className="flex items-center gap-2">
                    <Logo className="size-8 text-primary" />
                    <span className="text-xl font-bold text-primary">Habitica</span>
                </div>
            </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 py-4">
            {navItems.map((item) => (
                 <Link key={item.href} href={item.href}>
                    <Button variant={pathname === item.href ? 'secondary' : 'ghost'} className="w-full justify-start">
                        <item.icon className="size-4 mr-2" />
                        <span>{item.label}</span>
                    </Button>
                 </Link>
            ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t pt-4">
            {user && (
                <>
                    {isAdmin && (
                        <Link href="/admin">
                            <Button variant="ghost" className="w-full justify-start">
                                <ShieldAlert className="size-4 mr-2 text-destructive"/>
                                <span>Panel Admin</span>
                            </Button>
                        </Link>
                    )}
                    <div className="flex items-center gap-2 rounded-md p-2">
                        <Avatar className="size-8">
                            {user.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
                            <AvatarFallback>{displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                            <span className="font-semibold">{displayName}</span>
                            <span className="text-xs text-muted-foreground">{currentRank.name} - {userXp} XP</span>
                        </div>
                    </div>

                     <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </>
            )}
        </div>
    </div>
  );
}


export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full text-sm font-medium transition-colors h-full',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Sheet>
            <SheetTrigger asChild>
                <div className="flex flex-col items-center justify-center gap-1 w-full text-sm font-medium transition-colors text-muted-foreground hover:text-primary h-full cursor-pointer">
                    <User className="h-6 w-6" />
                    <span>Perfil</span>
                </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto p-0">
                <ProfileSheetContent />
            </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
