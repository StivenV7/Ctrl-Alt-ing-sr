
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Users } from 'lucide-react';
import { ForumCategory } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AddCategoryDialog } from '@/components/forum/AddCategoryDialog';


export default function ForumHomePage() {
  const { user, userDoc, loading: authLoading, isAdmin } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [followedCategoryIds, setFollowedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    // Listen for categories
    const categoriesUnsub = onSnapshot(collection(db, 'forum_categories'), (snapshot) => {
      const cats: ForumCategory[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as ForumCategory);
      });
      setCategories(cats);
    });

    // Listen for user's followed categories
    if (userDoc) {
        const unsub = onSnapshot(userDoc.ref, (doc) => {
            setFollowedCategoryIds(doc.data()?.followedCategoryIds || []);
            setLoading(false);
        });
        return () => unsub();
    } else {
        setLoading(false);
    }


    return () => {
      categoriesUnsub();
    };
  }, [user, userDoc, authLoading]);

  const handleToggleFollow = async (categoryId: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const isFollowing = followedCategoryIds.includes(categoryId);

    try {
      await updateDoc(userDocRef, {
        followedCategoryIds: isFollowing ? arrayRemove(categoryId) : arrayUnion(categoryId),
      });
      toast({
        title: isFollowing ? 'Dejaste la comunidad' : '¡Te uniste a la comunidad!',
        description: `Ahora ${isFollowing ? 'no recibirás' : 'recibirás'} mensajes de esta comunidad.`,
      });
    } catch (error) {
      console.error("Error updating followed categories:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tu suscripción.' });
    }
  };

  const handleCreateCategory = async (name: string, description: string) => {
     if (!user || !isAdmin) return;
     try {
        const newCategoryRef = await addDoc(collection(db, 'forum_categories'), {
            name,
            description,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        });
        await handleToggleFollow(newCategoryRef.id); // Automatically follow created category
        toast({ title: 'Comunidad Creada', description: `¡La comunidad "${name}" ha sido creada y ya la sigues!` });

     } catch(error) {
        console.error("Error creating category:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la comunidad.' });
     }
  }

  const handleSuggestCategory = async (name: string, description: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'category_suggestions'), {
        name,
        description,
        requestedBy: user.uid,
        requestedByName: user.displayName,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Sugerencia Enviada', description: 'Tu sugerencia de comunidad ha sido enviada para revisión.' });
    } catch (error) {
      console.error("Error suggesting category:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar tu sugerencia.' });
    }
  };

  if (authLoading || loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle>Acceso denegado</CardTitle>
          <CardContent className="mt-4">
            <p>Debes iniciar sesión para unirte a las comunidades.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline">Explorar Comunidades</CardTitle>
                    </div>
                    <CardDescription className="mt-1">Únete a las conversaciones que te interesan.</CardDescription>
                </div>
                <AddCategoryDialog 
                    onCreate={isAdmin ? handleCreateCategory : handleSuggestCategory}
                    isAdmin={isAdmin}
                >
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {isAdmin ? 'Crear Comunidad' : 'Sugerir Comunidad'}
                    </Button>
                </AddCategoryDialog>
            </CardHeader>
        </Card>

      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map((cat) => {
            const isFollowing = followedCategoryIds.includes(cat.id);
            return (
              <Card key={cat.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-muted/50 transition-colors gap-4">
                <div className="flex-grow">
                  <Link href={`/forum/${cat.id}`} className="block">
                    <h3 className="font-semibold text-lg hover:underline">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                  </Link>
                </div>
                <div className="ml-auto flex-shrink-0 self-end sm:self-center">
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={() => handleToggleFollow(cat.id)}
                  >
                    {isFollowing ? 'Dejar de Seguir' : 'Unirme'}
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-12 text-muted-foreground">
            <p>No hay comunidades todavía.</p>
            <p>¡Crea o sugiere la primera!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
