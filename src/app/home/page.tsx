
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast"
import type { Habit, FirestoreHabit, ChatMessage, ChatOutput, HabitEntry } from '@/lib/types';
import { chat } from '@/ai/flows/chat-flow';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { format, startOfDay, isSameDay, parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Dumbbell, HeartPulse, TrendingUp } from 'lucide-react';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { AIChatPanel } from '@/components/AIChatPanel';
import { HabitProgress } from '@/components/HabitProgress';
import { Loader2 } from 'lucide-react';


// Map stored habit IDs to Lucide icons
const ICONS: { [key: string]: React.ElementType } = {
  'habit-1': BookOpen,
  'habit-2': Dumbbell,
  'habit-3': HeartPulse,
};

const getIconForHabit = (habitId: string) => {
  return ICONS[habitId] || TrendingUp;
};


export default function HomePage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userXp, setUserXp] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [user]);

  const loadUserData = useCallback(async () => {
    if (!userRef) return;
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const loadedHabits = (userData.habits || []).map((habit: FirestoreHabit) => ({
          ...habit,
          entries: habit.entries || [], // Ensure entries is always an array
          icon: getIconForHabit(habit.id),
        }));
        setHabits(loadedHabits);
        setUserXp(userData.xp || 0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar tus datos.",
      });
    } finally {
      setIsDataLoaded(true);
    }
  }, [userRef, toast]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && !isDataLoaded) {
      loadUserData();
    }
  }, [user, authLoading, router, isDataLoaded, loadUserData]);

  const saveData = useCallback(async (dataToSave: { [key: string]: any }) => {
    if (!userRef) return;
    try {
      await setDoc(userRef, dataToSave, { merge: true });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        variant: "destructive",
        title: "Error de guardado",
        description: "No se pudo guardar tu progreso.",
      });
    }
  }, [userRef, toast]);

  const handleUpdateEntry = (habitId: string, entryDate: string, newValues: Partial<HabitEntry>) => {
     let newXp = userXp;

     const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
            const oldCompletedCount = (h.entries || []).filter(e => e.completed).length;

            const updatedEntries = h.entries.map(e => e.date === entryDate ? { ...e, ...newValues } : e);

            const newCompletedCount = updatedEntries.filter(e => e.completed).length;
            if (newCompletedCount > oldCompletedCount) {
              newXp += (newCompletedCount - oldCompletedCount);
            }
             if (newCompletedCount < oldCompletedCount) {
              newXp -= (oldCompletedCount - newCompletedCount);
            }

            return { ...h, entries: updatedEntries };
        }
        return h;
    });

    setHabits(updatedHabits);
    if(newXp !== userXp) {
      setUserXp(newXp);
    }

    const habitsToSave = updatedHabits.map(({ icon, ...rest }) => rest);
    saveData({ habits: habitsToSave, xp: newXp });
  };
  
  const handleAddNewEntry = (habitId: string) => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    let habitModified = false;
    
    const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
            const mainEntries = h.entries.filter(e => !e.isExtra);
            const lastMainEntry = mainEntries.length > 0 ? mainEntries.sort((a, b) => b.date.localeCompare(a.date))[0] : null;

            // Check if we can add a new entry for today
            if (!lastMainEntry || !isSameDay(parseISO(lastMainEntry.date), parseISO(todayStr))) {
                // Add a new main entry for a new day
                const newEntry: HabitEntry = { date: todayStr, completed: false, journal: '', isExtra: false };
                h.entries.push(newEntry);
                habitModified = true;
                toast({ title: `Nuevo día, nuevo reto!`, description: 'Has registrado tu avance para hoy.' });
            } else {
                // Add an extra entry for the same day
                const newEntry: HabitEntry = { date: todayStr, completed: false, journal: '', isExtra: true };
                h.entries.push(newEntry);
                habitModified = true;
                toast({ title: '¡Imparable!', description: 'Has añadido una entrada extra para hoy.' });
            }
        }
        return h;
    });

    if (habitModified) {
        setHabits(updatedHabits);
        const habitsToSave = updatedHabits.map(({ icon, ...rest }) => rest);
        saveData({ habits: habitsToSave });
    } else {
        toast({ title: 'Ya registraste hoy', description: 'Puedes añadir una entrada extra si quieres.', variant: 'default' });
    }
  };

  const handleAddHabit = (name: string, category: string, description: string, duration: number) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      description,
      duration,
      icon: TrendingUp,
      entries: [],
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    const { icon, ...habitToSave } = newHabit;
    saveData({ habits: [...habits.map(({icon, ...rest}) => rest), habitToSave] });
    toast({
      title: "Reto añadido",
      description: `¡Empezaste el reto "${name}"!`,
    })
  };

  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits.map(({icon, ...rest}) => rest) });
    toast({
      title: "Reto eliminado",
      description: "El reto ha sido eliminado de tu lista.",
    });
  };
  
  const handleChatSubmit = async (message: string): Promise<ChatOutput> => {
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);
    
    try {
      const result = await chat({
        history: newHistory,
      });

      const assistantMessage: ChatMessage = { role: 'assistant', content: result.answer, suggestions: result.suggestions };
      const finalHistory = [...newHistory, assistantMessage];
      setChatHistory(finalHistory);
      // Chat history is ephemeral and not saved to Firestore
      
      return result;
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errMessage: ChatMessage = { role: 'assistant', content: "Lo siento, tuve un problema. Inténtalo de nuevo." };
      setChatHistory([...newHistory, errMessage]);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo obtener respuesta del coach.",
      });
      throw error; // Re-throw to be caught by the caller if needed
    }
  };


  if (authLoading || !user || !isDataLoaded) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Mis Retos</CardTitle>
            <AddHabitDialog onAddHabit={handleAddHabit}>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Reto
                </Button>
            </AddHabitDialog>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {habits.length > 0 ? habits.map(habit => (
                <HabitProgress 
                    key={habit.id} 
                    habit={habit} 
                    onAddNewEntry={handleAddNewEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onDelete={handleDeleteHabit}
                />
                )) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Aún no tienes retos.</p>
                    <p>¡Añade uno y empieza a ganar XP!</p>
                </div>
                )}
            </div>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <AIChatPanel 
            chatHistory={chatHistory}
            onSubmit={handleChatSubmit}
            onAddHabit={handleAddHabit}
        />
      </div>
    </div>
  );
}
