
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, ArrowLeft, ShieldQuestion } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ForumMessage, ForumCategory } from '@/lib/types';
import Link from 'next/link';

export default function ForumCategoryPage({ params }: { params: { id: string } }) {
  const { user, userDoc, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categoryId = params.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);

    if (userDoc) {
      const followedIds = userDoc.data()?.followedCategoryIds || [];
      setIsMember(followedIds.includes(categoryId));
    } else {
        setIsMember(false);
    }
    
    // Fetch category details
    const categoryDocRef = doc(db, 'forum_categories', categoryId);
    getDoc(categoryDocRef).then(docSnap => {
        if(docSnap.exists()){
            setCategory({ id: docSnap.id, ...docSnap.data() } as ForumCategory);
        }
    });

    if (!user || !isMember) {
        setLoading(false);
        return;
    }

    const q = query(
      collection(db, 'forum_messages'),
      where('categoryId', '==', categoryId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: ForumMessage[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ForumMessage);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching forum messages:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userDoc, authLoading, categoryId, isMember]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending || !isMember) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'forum_messages'), {
        content: newMessage,
        timestamp: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName,
        userImage: user.photoURL,
        categoryId: categoryId,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  if (authLoading || loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user || !isMember) {
    return (
        <div className="flex h-full items-center justify-center">
            <Card className="p-8 text-center">
                <CardHeader>
                    <ShieldQuestion className="h-12 w-12 mx-auto text-destructive"/>
                    <CardTitle>No eres miembro</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 space-y-4">
                    <p>Debes unirte a esta comunidad para ver y enviar mensajes.</p>
                    <Button asChild>
                        <Link href="/forum">Explorar comunidades</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <Card className="shadow-lg h-full flex flex-col max-h-[calc(100vh-12rem)]">
      <CardHeader className="border-b">
        <div className="flex items-center gap-4">
            <Link href="/forum" legacyBehavior>
                <a className="p-2 rounded-full hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                </a>
            </Link>
            <div >
                <CardTitle className="font-headline text-xl">{category?.name || 'Comunidad'}</CardTitle>
                <p className="text-sm text-muted-foreground">{category?.description}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.userId === user?.uid ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={msg.userImage || undefined} />
              <AvatarFallback>{msg.userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                <div
                    className={`rounded-lg px-3 py-2 max-w-sm ${
                    msg.userId === user?.uid
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {msg.userName} - {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true, locale: es }) : 'justo ahora'}
                </p>
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
