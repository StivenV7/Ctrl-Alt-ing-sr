
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Home, LogOut, MessagesSquare, ShieldAlert, Heart } from 'lucide-react';
import { useMemo } from 'react';
import { RANKS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from './icons';
import { SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/fanpage', label: 'Fan Page', icon: Heart },
    { href: '/forum', label: 'Foro', icon: MessagesSquare },
];

export function SidebarNavContent() {
  const pathname = usePathname();
  const { user, signOut, isAdmin, userDoc } = useAuth();
  const displayName = userDoc?.data()?.displayName || user?.displayName || 'Usuario';
  const userXp = userDoc?.data()?.xp || 0;

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(rank => userXp >= rank.minXp) ?? RANKS[0];
  }, [userXp]);

  return (
    <div className="flex h-full flex-col">
        <SheetHeader className="p-4 pb-4 border-b text-left">
            <SheetTitle>
                <div className="flex items-center gap-2">
                    <Logo className="size-8 text-primary" />
                    <span className="text-xl font-bold text-primary">Habitica</span>
                </div>
            </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
                 <Link key={item.href} href={item.href}>
                    <Button variant={pathname === item.href ? 'secondary' : 'ghost'} className="w-full justify-start">
                        <item.icon className="size-4 mr-2" />
                        <span>{item.label}</span>
                    </Button>
                 </Link>
            ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t p-4">
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
