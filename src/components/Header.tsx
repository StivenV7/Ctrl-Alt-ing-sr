'use client';

import { Logo } from '@/components/icons';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import Link from 'next/link';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">Habitica</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggleButton />
            {!loading && !user && (
              <div className="hidden sm:flex items-center gap-2">
                 <Button asChild variant="ghost">
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Regístrate Gratis</Link>
                </Button>
              </div>
            )}
        </div>
      </div>
    </header>
  );
}
