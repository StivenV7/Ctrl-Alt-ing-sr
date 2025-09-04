
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold">¿Listo para Empezar tu Viaje?</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          No esperes al "momento perfecto". El mejor momento para empezar es ahora. Crea tu cuenta gratuita hoy mismo y da el primer, y más importante, paso hacia una vida más productiva y saludable.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/login">Regístrate Gratis Ahora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
