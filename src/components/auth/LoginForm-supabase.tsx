'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth-supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  username: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
}).refine(data => {
  if (activeTab === 'signup' && (!data.username || data.username.length < 3)) {
    return false;
  }
  return true;
}, {
  message: 'El nombre de usuario debe tener al menos 3 caracteres.',
  path: ['username'],
});

let activeTab = 'signin';

type LoginFormProps = {
  setError: (error: string | null) => void;
};

export function LoginForm({ setError }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('signin');
  const { setTheme } = useAuth();
  
  activeTab = currentTab;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', username: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    try {
      if (currentTab === 'signin') {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
      } else {
        // Sign up
        if (!values.username) {
          form.setError("username", { type: "manual", message: "El nombre de usuario es requerido."});
          setLoading(false);
          return;
        }
        if (!values.gender) {
          form.setError("gender", { type: "manual", message: "El sexo es requerido."});
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('No se pudo crear el usuario');

        const userGender = values.gender || 'prefer-not-to-say';
        const theme = userGender === 'male' ? 'blue' : userGender === 'female' ? 'pink' : 'light';
        setTheme(theme);
        
        // Create user profile in database
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: values.email,
            display_name: values.username,
            gender: userGender,
            theme: theme,
            xp: 0,
            habits: [],
            role: 'user',
          });

        if (dbError) throw dbError;
      }
    } catch (error: any) {
      setError(getSupabaseErrorMessage(error.message || error.code));
    } finally {
      setLoading(false);
    }
  };

  const getSupabaseErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Correo o contraseña incorrectos.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'Este correo electrónico ya está en uso.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Por favor, confirma tu correo electrónico.';
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return 'Ha ocurrido un error. Inténtalo de nuevo.';
  };

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
        <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="signup">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="username"
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo (afecta el tema de color)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu sexo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
