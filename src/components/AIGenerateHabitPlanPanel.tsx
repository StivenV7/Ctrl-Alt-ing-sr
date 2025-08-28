'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Loader2, Sparkles, Plus } from 'lucide-react';
import type { GenerateHabitPlanOutput } from '@/ai/flows/habit-insights';

type AIGenerateHabitPlanPanelProps = {
  userGoals: string;
  setUserGoals: (goals: string) => void;
  suggestedHabits: GenerateHabitPlanOutput['habits'];
  loading: boolean;
  onGeneratePlan: () => void;
  onAddHabit: (name: string, category: string) => void;
};

export function AIGenerateHabitPlanPanel({
  userGoals,
  setUserGoals,
  suggestedHabits,
  loading,
  onGeneratePlan,
  onAddHabit,
}: AIGenerateHabitPlanPanelProps) {
  return (
    <Card className="shadow-lg sticky top-20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">Generador de Hábitos con IA</CardTitle>
        </div>
        <CardDescription>Define tus metas y la IA te sugerirá un plan de hábitos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user-goals">Mis Metas</Label>
          <Textarea
            id="user-goals"
            placeholder="Ej: Quiero ser más disciplinado y mejorar mi salud física."
            value={userGoals}
            onChange={(e) => setUserGoals(e.target.value)}
            className="mt-1"
          />
        </div>
        {loading && (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Generando plan de hábitos...</span>
          </div>
        )}
        {suggestedHabits.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold">Plan de Hábitos Sugerido:</h4>
            <ul className="space-y-2">
              {suggestedHabits.map((habit, index) => (
                <li key={index} className="flex items-center justify-between gap-3 text-sm p-2 bg-background rounded-md border">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 mt-1 shrink-0 text-primary"/>
                    <div>
                      <span className="font-semibold">{habit.name}</span>
                      <p className="text-xs text-muted-foreground">{habit.category}</p>
                    </div>
                  </div>
                   <Button size="sm" variant="outline" onClick={() => onAddHabit(habit.name, habit.category)}>
                      <Plus className="h-4 w-4 mr-1"/>
                      Añadir
                   </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onGeneratePlan} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            'Generar Plan de Hábitos'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
