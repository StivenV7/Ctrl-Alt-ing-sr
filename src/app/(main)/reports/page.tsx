'use client';

import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, isWithinInterval, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { Habit } from '@/lib/types';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Loader2 } from 'lucide-react';

type ReportData = {
  totalEntries: number;
  completedEntries: number;
  completionRate: number;
  habitsBreakdown: {
    name: string;
    completed: number;
    total: number;
  }[];
};

export default function ReportsPage() {
  const { userDoc, loading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(addDays(new Date(), -30)),
    to: startOfDay(new Date()),
  });

  const habits: Habit[] = useMemo(() => {
    if (loading || !userDoc?.exists()) return [];
    return userDoc.data()?.habits || [];
  }, [userDoc, loading]);

  const reportData: ReportData | null = useMemo(() => {
    if (!dateRange?.from || !habits) return null;

    // Ensure the 'to' date includes the entire day
    const interval = {
      start: startOfDay(dateRange.from),
      end: dateRange.to ? startOfDay(addDays(dateRange.to, 1)) : startOfDay(addDays(dateRange.from, 1)),
    };

    let totalEntries = 0;
    let completedEntries = 0;
    const habitsBreakdown: ReportData['habitsBreakdown'] = [];

    habits.forEach(habit => {
      const entriesInDateRange = habit.entries.filter(entry =>
        isWithinInterval(startOfDay(new Date(entry.date)), interval)
      );

      if (entriesInDateRange.length > 0) {
        const completedInDateRange = entriesInDateRange.filter(e => e.completed).length;
        totalEntries += entriesInDateRange.length;
        completedEntries += completedInDateRange;
        habitsBreakdown.push({
          name: habit.name,
          completed: completedInDateRange,
          total: entriesInDateRange.length,
        });
      }
    });

    return {
      totalEntries,
      completedEntries,
      completionRate: totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0,
      habitsBreakdown,
    };
  }, [dateRange, habits]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const chartData = reportData?.habitsBreakdown.map(h => ({ name: h.name, Días: h.completed })) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Reportes de Progreso</h1>
          <p className="text-muted-foreground">Analiza tu rendimiento y mantén la motivación.</p>
        </div>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {!reportData || reportData.totalEntries === 0 ? (
         <Card className="text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">No hay datos para el período seleccionado.</p>
                <p className="text-sm text-muted-foreground mt-1">Intenta con otro rango de fechas o registra más avances.</p>
            </CardContent>
         </Card>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Tasa de Cumplimiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{reportData.completionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {reportData.completedEntries} de {reportData.totalEntries} días registrados fueron completados.
                        </p>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Desglose por Hábito</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                />
                                <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "var(--radius)"
                                    }}
                                />
                                <Bar dataKey="Días" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}
