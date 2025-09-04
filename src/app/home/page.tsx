
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast"
import type { Habit, FirestoreHabit, ChatMessage, ChatOutput, HabitEntry } from '@/lib/types';
import { chat } from '@/ai/flows/chat-flow';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { addDays, format, startOfDay } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Dumbbell, HeartPulse, TrendingUp } from 'lucide-react';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { AIChatPanel } from '@/components/AIChatPanel';
import { HabitDetails } from '@/components/HabitDetails';
import { calculateStreak } from '@/lib/utils';
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
      // Use setDoc with merge: true to both create and update documents safely.
      await setDoc(userRef, dataToSave, { merge: true });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        variant: "destructive",
        title: "Error de guardado",
        description: "No se pudo guardar tu progreso. Revisa tu conexión.",
      });
    }
  }, [userRef, toast]);
  
  const handleHabitUpdate = (habitId: string, updatedEntries: HabitEntry[]) => {
    let newXp = userXp;
    
    const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
            const oldCompletedCount = (h.entries || []).filter(e => e.completed).length;
            const newCompletedCount = updatedEntries.filter(e => e.completed).length;
            
            // Grant XP for new completions, but don't remove for un-checking
            if (newCompletedCount > oldCompletedCount) {
              newXp += (newCompletedCount - oldCompletedCount);
            }

            return { ...h, entries: updatedEntries };
        }
        return h;
    });

    const targetHabitEntries = updatedHabits.find(h => h.id === habitId)?.entries || [];
    const updatedStreak = calculateStreak(targetHabitEntries);
    
    if (updatedStreak.justIncreased) {
       toast({
        title: `🔥 ¡Racha de ${updatedStreak.count} días!`,
        description: "¡Sigue así!",
      });
    }

    setHabits(updatedHabits);
    if(newXp !== userXp) {
      setUserXp(newXp);
    }

    const habitsToSave = updatedHabits.map(({ icon, ...rest }) => rest);
    saveData({ habits: habitsToSave, xp: newXp });
  };

  const handleAddHabit = (name: string, category: string, description: string, duration: number) => {
    const startDate = startOfDay(new Date());
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      description,
      duration,
      icon: TrendingUp,
      entries: Array.from({ length: duration }, (_, i) => ({
        date: format(addDays(startDate, i), 'yyyy-MM-dd'),
        completed: false,
        journal: '',
      })),
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    const { icon, ...habitToSave } = newHabit;
    saveData({ habits: [...habits.map(({icon, ...rest}) => rest), habitToSave] });
    toast({
      title: "Hábito añadido",
      description: `Has añadido "${name}" a tu lista.`,
    })
  };

  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits.map(({icon, ...rest}) => rest) });
    toast({
      title: "Hábito eliminado",
      description: "El hábito ha sido eliminado de tu lista.",
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
      const errMessage: ChatMessage = { role: 'assistant', content: "Lo siento, tuve un problema para responder. Inténtalo de nuevo." };
      setChatHistory([...newHistory, errMessage]);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo obtener respuesta. Inténtalo de nuevo.",
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
                <HabitDetails 
                    key={habit.id} 
                    habit={habit} 
                    onUpdate={handleHabitUpdate}
                    onDelete={handleDeleteHabit}
                />
                )) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No tienes retos todavía.</p>
                    <p>¡Añade uno para empezar!</p>
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
