
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Home, LogOut, MessagesSquare, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import { RANKS } from '@/lib/constants';

const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/forum', label: 'Foro', icon: MessagesSquare },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut, isAdmin, userDoc } = useAuth();
  const displayName = userDoc?.data()?.displayName || user?.displayName || 'Usuario';
  const userXp = userDoc?.data()?.xp || 0;

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(rank => userXp >= rank.minXp) ?? RANKS[0];
  }, [userXp]);

  return (
    <Sidebar>
        <SidebarHeader>
             <div className="flex items-center gap-2">
                <Logo className="size-8 text-primary" />
                <span className="text-xl font-bold text-primary">Habitica</span>
             </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {navItems.map((item) => (
                     <SidebarMenuItem key={item.href}>
                        <Link href={item.href} className="block w-full">
                            <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                                <item.icon className="size-4" />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                     </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {user && (
                <div className="flex flex-col gap-2">
                    {isAdmin && (
                        <Link href="/admin">
                            <SidebarMenuButton>
                                <ShieldAlert className="size-4 text-destructive"/>
                                <span>Panel Admin</span>
                            </SidebarMenuButton>
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
                </div>
            )}
        </SidebarFooter>
    </Sidebar>
  );
}
