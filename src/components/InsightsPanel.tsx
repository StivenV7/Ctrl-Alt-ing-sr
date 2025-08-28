'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import type { HabitInsightsOutput } from '@/ai/flows/habit-insights';

type InsightsPanelProps = {
  userGoals: string;
  setUserGoals: (goals: string) => void;
  insights: HabitInsightsOutput['insights'];
  loading: boolean;
  onGetInsights: () => void;
};

export function InsightsPanel({
  userGoals,
  setUserGoals,
  insights,
  loading,
  onGetInsights,
}: InsightsPanelProps) {
  return (
    <Card className="shadow-lg sticky top-20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <CardTitle className="font-headline">Sugerencias con IA</CardTitle>
        </div>
        <CardDescription>Obtén consejos personalizados para alcanzar tus metas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user-goals">Mis Metas (Opcional)</Label>
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
            <span>Generando sugerencias...</span>
          </div>
        )}
        {insights.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold">Aquí tienes algunas ideas:</h4>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-sm p-2 bg-background rounded-md">
                  <Lightbulb className="h-4 w-4 mt-1 shrink-0 text-accent"/>
                  <div>
                    <span className="font-semibold">{insight.habitName}:</span> {insight.suggestion}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onGetInsights} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Pensando...
            </>
          ) : (
            'Obtener Sugerencias'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
