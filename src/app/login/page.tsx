
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }
  
  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
        <div className='absolute top-4 left-4'>
            <Button asChild variant="ghost">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Volver al Inicio</Link>
            </Button>
        </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center">
          <Logo className="h-12 w-12 text-primary" />
          <CardTitle className="font-headline text-3xl">Bienvenido a Habitica</CardTitle>
          <CardDescription>Inicia sesión para continuar con tus hábitos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <LoginForm setError={setError} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>
            <GoogleSignInButton setError={setError} />
            {error && (
              <p className="mt-2 text-center text-sm text-destructive">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
