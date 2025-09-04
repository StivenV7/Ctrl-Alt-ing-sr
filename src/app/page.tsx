
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Crea y Sigue Retos',
    description:
      'Define tus propios retos de hábitos con duraciones personalizadas y sigue tu progreso día a día.',
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: 'Gamificación Motivadora',
    description:
      'Gana puntos de experiencia (XP) por cada día que completas y sube de rango para desbloquear logros.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Coach de IA Personal',
    description:
      'Conversa con nuestro coach de IA para obtener sugerencias de retos personalizadas y mantener la motivación.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5"></div>
                <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                    Transforma tu Vida, <span className="text-primary">un Hábito a la Vez.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Habitica es tu compañero gamificado para construir hábitos duraderos. Gana XP, sube de nivel y alcanza tus metas con la ayuda de un coach de IA personalizado.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/login">Comenzar Ahora</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold">¿Por qué Habitica?</h2>
              <p className="mt-2 text-muted-foreground">
                Todo lo que necesitas para construir la mejor versión de ti mismo.
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

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid items-center gap-12 md:grid-cols-2">
                    <div>
                        <h2 className="text-3xl font-bold">Simple, Intuitivo y Poderoso</h2>
                        <p className="mt-4 text-muted-foreground">
                            Comienza tu viaje de superación en tres sencillos pasos. Nuestra plataforma está diseñada para que te concentres en lo que realmente importa: tu progreso.
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

        {/* Community Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Más Allá de los Hábitos</h2>
              <p className="mt-2 text-muted-foreground">
                Habitica es también un lugar para conectar e inspirar.
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
                    <p className="text-muted-foreground">Únete a nuestros foros temáticos para discutir sobre fitness, lectura, finanzas y más. Comparte consejos, haz preguntas y encuentra compañeros de viaje.</p>
                  </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold">¿Listo para Empezar tu Viaje?</h2>
                <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
                    Crea tu cuenta gratuita hoy mismo y da el primer paso hacia una vida más productiva y saludable.
                </p>
                <div className="mt-6">
                    <Button asChild size="lg">
                        <Link href="/login">Regístrate Gratis</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
