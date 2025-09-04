
'use client';

import { Logo } from './icons';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Habitica</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-primary">
              Características
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-primary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Habitica. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
