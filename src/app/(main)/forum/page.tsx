
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
  const { user, loading: authLoading } = useAuth();
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
    const userDocRef = doc(db, 'users', user.uid);
    const userUnsub = onSnapshot(userDocRef, (doc) => {
        setFollowedCategoryIds(doc.data()?.followedCategoryIds || []);
        setLoading(false);
    });

    return () => {
      categoriesUnsub();
      userUnsub();
    };
  }, [user, authLoading]);

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
     if (!user) return;
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
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">Explorar Comunidades</CardTitle>
            </div>
            <CardDescription>Únete a las conversaciones que te interesan.</CardDescription>
        </div>
        <AddCategoryDialog onCreate={handleCreateCategory}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Comunidad
            </Button>
        </AddCategoryDialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((cat) => {
              const isFollowing = followedCategoryIds.includes(cat.id);
              return (
                <Card key={cat.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex-grow">
                    <Link href={`/forum/${cat.id}`} className="block">
                      <h3 className="font-semibold text-lg hover:underline">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </Link>
                  </div>
                  <div className="ml-4 flex-shrink-0">
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
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay comunidades todavía.</p>
              <p>¡Crea la primera!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

