
'use client';

import { useAuth } from '@/hooks/use-auth';
import { RANKS } from '@/lib/constants';
import { calculateCompletedHabitsByCategory } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy, Star } from 'lucide-react';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Habit } from '@/lib/types';
import { getIconForHabit } from '@/lib/utils';
import { FirestoreHabit } from '@/lib/types';

export default function RanksPage() {
  const { userDoc, loading } = useAuth();

  const userHabits: Habit[] = useMemo(() => {
    if (!userDoc?.exists()) return [];
    const userData = userDoc.data();
    return (userData?.habits || []).map((h: FirestoreHabit) => ({
      ...h,
      icon: getIconForHabit(h.id),
      entries: h.entries || [],
    }));
  }, [userDoc]);

  const completedHabitsByCategory = useMemo(() => calculateCompletedHabitsByCategory(userHabits), [userHabits]);

  const currentRankName = useMemo(() => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      const rank = RANKS[i];
      const requirementsMet = Object.entries(rank.requirements).every(([category, requiredCount]) => {
        const userCount = completedHabitsByCategory[category] || 0;
        return userCount >= requiredCount;
      });
      if (requirementsMet) {
        return rank.name;
      }
    }
    return RANKS[0].name;
  }, [completedHabitsByCategory]);


  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Sistema de Rangos</h1>
            <p className="mt-2 text-lg text-muted-foreground">Sube de nivel completando retos en diferentes categorías.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RANKS.map((rank, index) => {
                const isCurrent = rank.name === currentRankName;
                const isAchieved = RANKS.findIndex(r => r.name === currentRankName) >= index;
                const Icon = rank.icon;

                return (
                    <Card key={rank.name} className={`transition-all ${isCurrent ? 'border-primary ring-2 ring-primary shadow-lg' : ''} ${isAchieved ? 'bg-primary/5' : 'bg-card'}`}>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div className="flex items-center gap-4">
                             <Icon className={`h-10 w-10 ${isAchieved ? 'text-primary' : 'text-muted-foreground'}`} />
                             <div>
                                 <CardTitle className="font-headline">{rank.name}</CardTitle>
                                 <CardDescription>{rank.description}</CardDescription>
                             </div>
                           </div>
                           {isAchieved && <CheckCircle className="h-6 w-6 text-green-500" />}
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-2 text-sm">Requisitos:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {Object.entries(rank.requirements).map(([category, count]) => {
                                    const userCount = completedHabitsByCategory[category] || 0;
                                    const requirementMet = userCount >= count;
                                    return (
                                        <li key={category} className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                {requirementMet ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Star className="h-4 w-4" />}
                                                Retos de "{category}": {count}
                                            </span>
                                            <span className={`font-mono px-2 py-0.5 rounded-full text-xs ${requirementMet ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                                                {userCount}/{count}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  );
}

