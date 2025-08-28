'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from "firebase/firestore"; 
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
        await signInWithEmailAndPassword(auth, values.email, values.password);
      } else {
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
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: values.username,
        });

        const theme = values.gender === 'male' ? 'blue' : values.gender === 'female' ? 'pink' : 'light';
        setTheme(theme);
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: values.username,
          email: values.email,
          gender: values.gender,
          theme: theme,
          xp: 0,
          goals: 'Mejorar mi constancia y bienestar general.',
          habits: [], // Start with an empty list of habits
        });
      }
    } catch (error: any) {
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Correo o contraseña incorrectos.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está en uso.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil.';
      default:
        return 'Ha ocurrido un error. Inténtalo de nuevo.';
    }
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
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre de usuario" {...field} />
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
                  <FormLabel>Sexo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu sexo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefiero no decirlo</SelectItem>
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
