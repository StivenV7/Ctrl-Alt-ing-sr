
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNavContent } from './Sidebar';

const navItems = [
  { href: '/home', label: 'Inicio', icon: Home },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto grid h-16 max-w-lg grid-cols-2 items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
          <SheetContent side="left" className="p-0 w-72">
            <SidebarNavContent />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
