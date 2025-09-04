
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Users } from 'lucide-react';

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Crea y Sigue Retos',
    description: 'Define tus propios retos de hábitos con duraciones personalizadas, desde 7 hasta 90 días. Sigue tu progreso día a día en un calendario interactivo y anota tus experiencias.',
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: 'Gamificación Motivadora',
    description: 'Gana puntos de experiencia (XP) por cada día que completas. Sube de rango, desde Novato hasta Gran Maestro, y observa cómo crecen tus rachas de días consecutivos.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Coach de IA Personal',
    description: 'Conversa con nuestro coach de IA para obtener orientación y sugerencias de retos personalizadas. La IA te ayudará a definir metas claras y a mantener la motivación alta.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">¿Por qué Habitica?</h2>
          <p className="mt-2 text-muted-foreground">
            Fusionamos la ciencia de la formación de hábitos con la diversión de un juego. Aquí tienes todo lo que necesitas para construir la mejor versión de ti mismo.
            <br />
            <em className="text-sm text-primary">Att: Josué Sinisterra</em>
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
