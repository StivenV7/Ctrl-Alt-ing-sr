
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Users } from 'lucide-react';

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Crea y Sigue Retos',
    description: 'Define tus propios retos de hábitos con duraciones personalizadas y sigue tu progreso día a día.',
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: 'Gamificación Motivadora',
    description: 'Gana puntos de experiencia (XP) por cada día que completas y sube de rango para desbloquear logros.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Coach de IA Personal',
    description: 'Conversa con nuestro coach de IA para obtener sugerencias de retos personalizadas y mantener la motivación.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">¿Por qué Habitica?</h2>
          <p className="mt-2 text-muted-foreground">
            Todo lo que necesitas para construir la mejor versión de ti mismo.
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
