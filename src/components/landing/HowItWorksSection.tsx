
'use client';

import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Simple, Intuitivo y Poderoso</h2>
            <p className="mt-4 text-muted-foreground">
              Comienza tu viaje de superación en tres sencillos pasos. Nuestra plataforma está diseñada para que te concentres en lo que realmente importa: tu progreso.
              <br />
              <em className="text-sm">Att: Oscar Valle</em>
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">1. Elige o crea un reto</h3>
                  <p className="text-muted-foreground">Selecciona de nuestra lista o pide a la IA que cree un plan personalizado para ti.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">2. Registra tu progreso diario</h3>
                  <p className="text-muted-foreground">Marca tus tareas completadas y escribe tus experiencias en el diario incorporado.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">3. Sube de nivel y conecta</h3>
                  <p className="text-muted-foreground">Observa cómo crecen tu XP y tus rachas, y únete a la comunidad para compartir tu viaje.</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <Image
              src="https://picsum.photos/600/400"
              alt="Panel de la aplicación Habitica"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="app interface"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
