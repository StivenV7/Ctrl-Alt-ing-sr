
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
              Comienza tu viaje de superación en tres sencillos pasos. Nuestra plataforma está diseñada para que te concentres en lo que realmente importa: tu progreso. Olvídate de las complicaciones y enfócate en la acción.
              <br />
              <em className="text-sm text-primary">Att: Oscar Valle</em>
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">1. Elige o crea un reto</h3>
                  <p className="text-muted-foreground">Selecciona de nuestra lista de retos predefinidos o conversa con la IA para que diseñe un plan personalizado que se adapte perfectamente a tus metas y estilo de vida.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">2. Registra tu progreso diario</h3>
                  <p className="text-muted-foreground">Con un solo clic, marca tus tareas completadas en el calendario. Además, puedes usar el diario incorporado para anotar tus pensamientos, sentimientos y aprendizajes.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">3. Sube de nivel y conecta</h3>
                  <p className="text-muted-foreground">Observa cómo crecen tu XP y tus rachas de fuego con cada día de éxito. Únete a las comunidades del foro para compartir tu viaje, encontrar apoyo y motivar a otros.</p>
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
