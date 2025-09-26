
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { Switch } from '@/components/ui/switch';

const profileFormSchema = z.object({
  displayName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'La contraseña actual es requerida.' }),
  newPassword: z.string().min(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres.' }),
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function SettingsPage() {
  const { user, userDoc, updateUserProfile, changeUserPassword, deleteUserAccount, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });
  
  useEffect(() => {
    if (userDoc) {
      const userData = userDoc.data();
      profileForm.reset({
        displayName: userData?.displayName || user?.displayName || '',
      });
    }
  }, [userDoc, user, profileForm]);

  useEffect(() => {
    // Check localStorage for notification settings
    const storedPreference = localStorage.getItem('notificationsEnabled');
    if (storedPreference) {
      setNotificationsEnabled(storedPreference === 'true');
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);
  
  const handleNotificationToggle = (enabled: boolean) => {
    localStorage.setItem('notificationsEnabled', String(enabled));
    setNotificationsEnabled(enabled);
    if (enabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          localStorage.setItem('notificationsEnabled', 'true');
          setNotificationsEnabled(true);
          toast({ title: '¡Notificaciones activadas!', description: 'Recibirás recordatorios de tus hábitos.' });
        } else {
          localStorage.setItem('notificationsEnabled', 'false');
          setNotificationsEnabled(false);
          toast({ variant: 'destructive', title: 'Permiso denegado', description: 'No se pudieron activar las notificaciones.' });
        }
      });
    } else if (!enabled) {
        toast({ title: 'Notificaciones desactivadas', description: 'No recibirás más recordatorios.' });
    }
  };

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      await updateUserProfile(data.displayName);
      toast({
        title: '¡Éxito!',
        description: 'Tu nombre de perfil ha sido actualizado.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar tu perfil. Inténtalo de nuevo.',
      });
    }
  }
  
  async function onPasswordSubmit(data: PasswordFormValues) {
    try {
      await changeUserPassword(data.currentPassword, data.newPassword);
      toast({
        title: '¡Éxito!',
        description: 'Tu contraseña ha sido actualizada.',
      });
      passwordForm.reset();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al cambiar la contraseña',
        description: error.message || 'Ocurrió un error. Verifica tu contraseña actual.',
      });
    }
  }
  
  const isGoogleProvider = user?.providerData.some(p => p.providerId === 'google.com');


  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Configuración</h1>
            <p className="mt-2 text-lg text-muted-foreground">Gestiona los datos de tu cuenta y preferencias.</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
           <CardDescription>Personaliza tu experiencia en la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <FormLabel>Recordatorios de Hábitos</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones para completar tus hábitos diarios.
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
          <CardDescription>Actualiza tu nombre de usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
              <FormField
                control={profileForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {!isGoogleProvider && (
         <Card>
            <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña. Necesitarás tu contraseña actual para hacerlo.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contraseña Actual</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nueva Contraseña</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Actualizar Contraseña
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      )}

       <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          <CardDescription>
            Estas acciones son permanentes y no se pueden deshacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center p-4 rounded-md border border-destructive/50">
                <div>
                    <h4 className="font-semibold">Eliminar mi cuenta</h4>
                    <p className="text-sm text-muted-foreground">Todos tus datos, hábitos y progreso serán eliminados permanentemente.</p>
                </div>
                 <DeleteAccountDialog onDeleteAccount={deleteUserAccount} isGoogleProvider={isGoogleProvider ?? false} />
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
