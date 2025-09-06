
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function CommunitySection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Más Allá de los Hábitos</h2>
          <p className="mt-2 text-muted-foreground">
            Crecer es mejor en compañía. Conecta, comparte y encuentra inspiración en nuestras comunidades.
            <br />
            <em className="text-sm text-primary">Att: Kevin Quintero</em>
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-1 md:max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                <CardTitle>Comunidades de Interés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Únete a foros temáticos sobre lectura, fitness, finanzas y más. Comparte consejos, haz preguntas y encuentra compañeros de viaje.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
