
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Heart } from 'lucide-react';
import { FanPost } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddPostDialog } from '@/components/fanpage/AddPostDialog';
import { FanPostCard } from '@/components/fanpage/FanPostCard';

export default function FanPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const postsQuery = query(collection(db, 'fan_posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postList: FanPost[] = [];
      snapshot.forEach((doc) => {
        postList.push({ id: doc.id, ...doc.data() } as FanPost);
      });
      setPosts(postList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({ title: 'Error', description: 'No se pudieron cargar las publicaciones.', variant: 'destructive' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddPost = async (title: string, content: string) => {
    if (!user) {
      toast({ title: 'No autenticado', description: 'Debes iniciar sesión para publicar.', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(db, 'fan_posts'), {
        title,
        content,
        authorId: user.uid,
        authorName: user.displayName,
        authorImage: user.photoURL,
        createdAt: serverTimestamp(),
      });
      toast({ title: '¡Publicación Creada!', description: 'Tu publicación ahora es visible para la comunidad.' });
    } catch (error) {
      console.error("Error adding post:", error);
      toast({ title: 'Error', description: 'No se pudo crear tu publicación.', variant: 'destructive' });
    }
  };

  if (authLoading || loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Fan Page de la Comunidad</CardTitle>
            </div>
            <CardDescription className="mt-1">Un espacio para compartir ideas, historias y creaciones.</CardDescription>
          </div>
          {user && (
            <AddPostDialog onCreate={handleAddPost}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Publicación
              </Button>
            </AddPostDialog>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => <FanPostCard key={post.id} post={post} />)
        ) : (
          <Card className="text-center py-12 text-muted-foreground">
            <p>Todavía no hay publicaciones.</p>
            <p>¡Sé el primero en compartir algo con la comunidad!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
