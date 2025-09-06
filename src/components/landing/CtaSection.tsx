
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold">¿Listo para Empezar?</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          El mejor momento es ahora. Crea tu cuenta gratis y da el primer paso, o únete a nuestra comunidad para recibir apoyo.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Regístrate Gratis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="https://chat.whatsapp.com/BHhcW7kOWKxApJOyu9nyNm" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Únete a la Comunidad
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
