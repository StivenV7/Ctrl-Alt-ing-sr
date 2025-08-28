'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import type { Habit, FirestoreHabit } from '@/lib/types';
import { INITIAL_HABITS, RANKS } from '@/lib/constants';
import { getHabitInsights, type HabitInsightsOutput } from '@/ai/flows/habit-insights';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { BookOpen, Dumbbell, HeartPulse } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, PlusCircle, Sparkles, TrendingUp, LogOut } from 'lucide-react';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { RankDisplay } from '@/components/RankDisplay';
import { InsightsPanel } from '@/components/InsightsPanel';
import { Logo } from '@/components/icons';


// Map stored habit IDs to Lucide icons
const ICONS: { [key: string]: React.ElementType } = {
  'habit-1': BookOpen,
  'habit-2': Dumbbell,
  'habit-3': HeartPulse,
};

const getIconForHabit = (habitId: string) => {
  return ICONS[habitId] || TrendingUp;
};


export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userXp, setUserXp] = useState(0);
  const [userGoals, setUserGoals] = useState('');
  const [insights, setInsights] = useState<HabitInsightsOutput['insights']>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
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
        const loadedHabits = userData.habits.map((habit: FirestoreHabit) => ({
          ...habit,
          icon: getIconForHabit(habit.id),
        }));
        setHabits(loadedHabits);
        setUserXp(userData.xp || 0);
        setUserGoals(userData.goals || '');
      } else {
        console.log("No such document! Should have been created on signup.");
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
      await updateDoc(userRef, dataToSave);
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        variant: "destructive",
        title: "Error de guardado",
        description: "No se pudo guardar tu progreso. Revisa tu conexión.",
      });
    }
  }, [userRef, toast]);
  
  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(rank => userXp >= rank.minXp) ?? RANKS[0];
  }, [userXp]);

  const handleCompleteHabit = (habitId: string) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    let newXp = userXp;
    let newStreakValue = 0;

    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        if (habit.completed) {
          // Un-complete
          const newStreak = habit.streak > 0 ? habit.streak - 1 : 0;
          newXp = Math.max(0, userXp - 1);
          return { ...habit, completed: false, streak: newStreak, lastCompletedDate: habit.streak > 1 ? yesterdayStr : null };
        } else {
          // Complete
          let newStreak = 1;
          if (habit.lastCompletedDate === yesterdayStr) {
            newStreak = habit.streak + 1;
          }
          newStreakValue = newStreak;
          newXp = userXp + 1;
          return { ...habit, completed: true, streak: newStreak, lastCompletedDate: todayStr };
        }
      }
      return habit;
    });

    if (newStreakValue > 1) {
      toast({
        title: `🔥 Racha de ${newStreakValue} días!`,
        description: "Sigue así!",
      })
    }
    
    setHabits(updatedHabits);
    setUserXp(newXp);
    saveData({ habits: updatedHabits.map(({icon, ...rest}) => rest), xp: newXp });
  };

  const handleAddHabit = (name: string, category: string) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      icon: TrendingUp,
      completed: false,
      streak: 0,
      lastCompletedDate: null,
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits.map(({icon, ...rest}) => rest) });
    toast({
      title: "Hábito añadido",
      description: `Has añadido "${name}" a tu lista.`,
    })
  };

  const handleGoalsChange = (goals: string) => {
    setUserGoals(goals);
    saveData({ goals });
  };
  
  const handleGetInsights = async () => {
    setLoadingInsights(true);
    setInsights([]);
    try {
      const result = await getHabitInsights({
        habits: habits,
        userGoals: userGoals || "Mejorar mi constancia y bienestar general.",
      });
      setInsights(result.insights);
    } catch (error) {
      console.error("Error getting AI insights:", error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudieron obtener las sugerencias. Inténtalo de nuevo.",
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  if (authLoading || !user || !isDataLoaded) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">Habitica</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <RankDisplay rank={currentRank} xp={userXp} />
            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">Mis Hábitos</CardTitle>
                <AddHabitDialog onAddHabit={handleAddHabit}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Hábito
                  </Button>
                </AddHabitDialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {habits.length > 0 ? habits.map(habit => (
                    <Card key={habit.id} className={`transition-all duration-300 ${habit.completed ? 'bg-accent/50 border-primary/50' : ''}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Checkbox 
                          id={`habit-${habit.id}`}
                          checked={habit.completed}
                          onCheckedChange={() => handleCompleteHabit(habit.id)}
                          className="h-6 w-6"
                          aria-label={`Marcar ${habit.name} como completado`}
                        />
                         <div className="flex-grow grid gap-1">
                          <label htmlFor={`habit-${habit.id}`} className="font-semibold cursor-pointer">{habit.name}</label>
                          <p className="text-sm text-muted-foreground">{habit.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500 font-bold">
                          <Flame className="h-5 w-5"/>
                          <span>{habit.streak}</span>
                        </div>
                        <Badge variant={habit.completed ? 'default' : 'secondary'} className={`transition-colors ${habit.completed ? 'bg-primary text-primary-foreground' : ''}`}>
                          {habit.completed ? 'Completado' : 'Pendiente'}
                        </Badge>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No tienes hábitos todavía.</p>
                      <p>¡Añade uno para empezar!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <InsightsPanel 
              userGoals={userGoals}
              setUserGoals={handleGoalsChange}
              insights={insights}
              loading={loadingInsights}
              onGetInsights={handleGetInsights}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
