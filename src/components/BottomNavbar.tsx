
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessagesSquare, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from './ui/button';
import { RankDisplay } from './RankDisplay';
import { Rank } from '@/lib/types';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/forum', label: 'Foro', icon: MessagesSquare },
];

type BottomNavbarProps = {
  rank: Rank;
  xp: number;
  displayName: string;
  onSignOut: () => void;
}

export function BottomNavbar({ rank, xp, displayName, onSignOut }: BottomNavbarProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-16 justify-around items-center">
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 w-full text-sm font-medium transition-colors text-muted-foreground hover:text-primary h-full">
                <UserIcon className="h-6 w-6" />
                <span>Perfil</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 mb-2">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Mi Perfil</h4>
                <p className="text-sm text-muted-foreground">
                  Tu progreso y rango actual.
                </p>
              </div>
              <Separator />
              <RankDisplay rank={rank} xp={xp} displayName={displayName} />
              {isAdmin && (
                 <Button variant="secondary" asChild className="w-full">
                    <Link href="/admin">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Panel de Admin
                    </Link>
                 </Button>
              )}
              <Button variant="outline" onClick={onSignOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
