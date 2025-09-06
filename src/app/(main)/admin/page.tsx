
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { FirestoreUser, ForumCategory, CategorySuggestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Check, X, ShieldQuestion, Library, User, Hourglass } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    
    // Quick redirect if not admin, but main check will be server-side with rules
    if (!isAdmin) {
        setLoading(false); // Stop loading, the render will handle the redirect/denial message
        return;
    }


    // Fetch users
    const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList: FirestoreUser[] = [];
      snapshot.forEach((doc) => userList.push(doc.data() as FirestoreUser));
      setUsers(userList);
    }, (error) => {
        console.error("Error fetching users:", error);
        toast({title: 'Error de Permisos', description: 'No se pudieron cargar los usuarios. Asegúrate de tener rol de administrador.', variant: 'destructive'});
    });

    // Fetch categories
    const categoriesUnsub = onSnapshot(collection(db, 'forum_categories'), (snapshot) => {
      const categoryList: ForumCategory[] = [];
      snapshot.forEach((doc) => categoryList.push({ id: doc.id, ...doc.data() } as ForumCategory));
      setCategories(categoryList);
    });

    // Fetch suggestions
    const suggestionsQuery = query(collection(db, 'category_suggestions'));
    const suggestionsUnsub = onSnapshot(suggestionsQuery, (snapshot) => {
      const suggestionList: CategorySuggestion[] = [];
      snapshot.forEach((doc) => suggestionList.push({ id: doc.id, ...doc.data() } as CategorySuggestion));
      // Sort suggestions by date descending on the client-side
      const sortedSuggestions = suggestionList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });
      setSuggestions(sortedSuggestions);
    }, (error) => {
        console.error("Error fetching suggestions:", error);
        toast({title: 'Error de Permisos', description: 'No se pudieron cargar las sugerencias.', variant: 'destructive'});
    });

    setLoading(false);

    return () => {
      usersUnsub();
      categoriesUnsub();
      suggestionsUnsub();
    };
  }, [user, isAdmin, authLoading, router, toast]);
  
  const handleSuggestion = async (suggestion: CategorySuggestion, newStatus: 'approved' | 'rejected') => {
    const suggestionRef = doc(db, 'category_suggestions', suggestion.id);
    try {
        if(newStatus === 'approved'){
            // Create the new category
            await addDoc(collection(db, 'forum_categories'), {
                name: suggestion.name,
                description: suggestion.description,
                createdBy: suggestion.requestedBy,
                createdAt: serverTimestamp(),
            });
             // Update the suggestion status
            await updateDoc(suggestionRef, { status: 'approved' });
            toast({title: 'Sugerencia Aprobada', description: `La comunidad "${suggestion.name}" ha sido creada.`})

        } else { // rejected
            await updateDoc(suggestionRef, { status: 'rejected' });
            toast({title: 'Sugerencia Rechazada', description: `La sugerencia para "${suggestion.name}" fue rechazada.`, variant: 'destructive'})
        }
    } catch (error) {
        console.error("Error handling suggestion:", error);
        toast({ title: 'Error', description: 'No se pudo procesar la sugerencia.', variant: 'destructive' });
    }
  };

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
        <div className="flex h-full items-center justify-center">
            <Card className="p-8 text-center">
                <CardHeader>
                    <ShieldQuestion className="h-12 w-12 mx-auto text-destructive"/>
                    <CardTitle>Acceso Denegado</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 space-y-4">
                    <p>No tienes permisos para acceder aquí.</p>
                    <Button asChild>
                        <a href="/">Volver al inicio</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Panel de Administración</CardTitle>
              <CardDescription>Gestiona usuarios, comunidades y sugerencias.</CardDescription>
          </CardHeader>
      </Card>
      
      <Tabs defaultValue="suggestions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Sugerencias ({pendingSuggestions.length})</TabsTrigger>
          <TabsTrigger value="users">Usuarios ({users.length})</TabsTrigger>
          <TabsTrigger value="categories">Comunidades ({categories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Hourglass className="h-5 w-5"/>Sugerencias Pendientes</CardTitle>
                    <CardDescription>Aprueba o rechaza nuevas comunidades.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingSuggestions.length > 0 ? (
                        pendingSuggestions.map(s => (
                            <Card key={s.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{s.name}</h3>
                                    <p className="text-sm text-muted-foreground">{s.description}</p>
                                    <p className="text-xs mt-2 text-muted-foreground">Sugerido por: {s.requestedByName} el {s.createdAt ? format(s.createdAt.toDate(), 'dd/MM/yyyy') : ''}</p>
                                </div>
                                <div className="flex gap-2 self-end md:self-center">
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleSuggestion(s, 'approved')}><Check className="mr-2 h-4 w-4"/>Aprobar</Button>
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleSuggestion(s, 'rejected')}><X className="mr-2 h-4 w-4"/>Rechazar</Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No hay sugerencias pendientes.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Gestión de Usuarios</CardTitle>
                    <CardDescription>Lista de todos los usuarios registrados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {users.map(u => (
                        <Card key={u.uid} className="p-3 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{u.displayName} {u.role === 'admin' && <span className="text-xs text-primary font-bold ml-1">(Admin)</span>}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                            <p className="text-sm font-medium">{u.xp} XP</p>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Library className="h-5 w-5"/>Comunidades Activas</CardTitle>
                    <CardDescription>Lista de todas las comunidades en el foro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                     {categories.map(c => (
                        <Card key={c.id} className="p-3">
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-sm text-muted-foreground">{c.description}</p>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
