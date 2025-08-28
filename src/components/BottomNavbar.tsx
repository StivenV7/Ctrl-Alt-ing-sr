
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessagesSquare, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/forum', label: 'Foro', icon: MessagesSquare },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container grid h-16 grid-cols-3 items-center">
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
        <SidebarTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 w-full text-sm font-medium transition-colors text-muted-foreground hover:text-primary h-full"
            >
                <Menu className="h-6 w-6" />
                <span>Menú</span>
            </button>
        </SidebarTrigger>
      </div>
    </nav>
  );
}
