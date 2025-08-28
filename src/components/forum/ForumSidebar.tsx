
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquarePlus, Hash } from 'lucide-react';
import { ForumCategory } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

export function ForumSidebar() {
  const { user, userDoc } = useAuth();
  const [followedCategories, setFollowedCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (!user || !userDoc) {
      setLoading(false);
      return;
    }

    const followedIds = userDoc.data()?.followedCategoryIds || [];
    if (followedIds.length === 0) {
      setFollowedCategories([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const q = query(collection(db, 'forum_categories'), where('__name__', 'in', followedIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats: ForumCategory[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as ForumCategory);
      });
      setFollowedCategories(cats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userDoc]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Comunidades</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex h-24 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline">Mis Comunidades</CardTitle>
        <CardDescription>Tus conversaciones activas.</CardDescription>
      </CardHeader>
      <CardContent>
        <nav className="flex flex-col gap-2">
          {followedCategories.length > 0 ? (
            followedCategories.map((cat) => {
                const isActive = pathname === `/forum/${cat.id}`;
                return (
                    <Link
                        key={cat.id}
                        href={`/forum/${cat.id}`}
                        className={cn(
                            buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm'}),
                            'justify-start'
                        )}
                    >
                        <Hash className="mr-2 h-4 w-4" />
                        {cat.name}
                    </Link>
                )
            })
          ) : (
            <div className="text-center text-sm text-muted-foreground p-4 border rounded-md">
              <p>No sigues ninguna comunidad todavía.</p>
            </div>
          )}
           <Link
            href="/forum"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mt-4")}
            >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Explorar más
            </Link>
        </nav>
      </CardContent>
    </Card>
  );
}
