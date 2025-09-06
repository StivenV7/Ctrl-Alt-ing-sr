
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold">¿Listo para Empezar?</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          El mejor momento es ahora. Crea tu cuenta gratis y da el primer paso.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/login">Regístrate Gratis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
