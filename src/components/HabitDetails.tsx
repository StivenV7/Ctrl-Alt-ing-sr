
'use client';

import { useState, useMemo } from 'react';
import type { Habit, HabitEntry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog';
import { Flame, Trash2 } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateStreak } from '@/lib/utils';


type HabitDetailsProps = {
    habit: Habit;
    onUpdate: (habitId: string, entries: HabitEntry[]) => void;
    onDelete: (habitId: string) => void;
};

export function HabitDetails({ habit, onUpdate, onDelete }: HabitDetailsProps) {
    const [entries, setEntries] = useState<HabitEntry[]>(habit.entries);
    const [pendingChanges, setPendingChanges] = useState<{[key: string]: Partial<HabitEntry>}>({});
    
    const completedCount = useMemo(() => entries.filter(e => e.completed).length, [entries]);
    const progressPercentage = useMemo(() => (completedCount / habit.duration) * 100, [completedCount, habit.duration]);
    const streak = useMemo(() => calculateStreak(entries).count, [entries]);

    const handleEntryChange = (date: string, newValues: Partial<HabitEntry>) => {
       setPendingChanges(prev => ({
           ...prev,
           [date]: { ...prev[date], ...newValues }
       }));
    };

    const handleSaveChanges = () => {
        const updatedEntries = entries.map(entry => {
            if (pendingChanges[entry.date]) {
                return { ...entry, ...pendingChanges[entry.date] };
            }
            return entry;
        });
        setEntries(updatedEntries);
        onUpdate(habit.id, updatedEntries);
        setPendingChanges({});
    };

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={habit.id} className="border rounded-lg mb-4 shadow-sm">
                <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex-grow grid grid-cols-5 items-center gap-4 text-left">
                        <div className="col-span-3">
                            <p className="font-semibold">{habit.name}</p>
                            <p className="text-sm text-muted-foreground">{habit.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500 font-bold">
                            <Flame className="h-5 w-5"/>
                            <span>{streak}</span>
                        </div>
                         <div className="text-sm">
                            <p>Día {completedCount}/{habit.duration}</p>
                            <Progress value={progressPercentage} className="h-2 mt-1" />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-4">{habit.description}</p>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {entries.map((entry) => (
                            <div key={entry.date} className="flex flex-col gap-2 p-3 rounded-md bg-muted/50">
                               <div className='flex items-center gap-3'>
                                 <Checkbox
                                        checked={pendingChanges[entry.date]?.completed ?? entry.completed}
                                        onCheckedChange={(checked) => handleEntryChange(entry.date, { completed: !!checked })}
                                        id={`check-${habit.id}-${entry.date}`}
                                    />
                                    <label htmlFor={`check-${habit.id}-${entry.date}`} className="flex-grow text-sm font-medium">
                                        {format(parseISO(entry.date), "EEEE, d 'de' MMMM", { locale: es })}
                                        {isToday(parseISO(entry.date)) && <span className="text-xs text-primary ml-2">(Hoy)</span>}
                                    </label>
                               </div>
                                <Textarea
                                    placeholder="Añade tu experiencia del día..."
                                    defaultValue={entry.journal}
                                    onChange={(e) => handleEntryChange(entry.date, { journal: e.target.value })}
                                    className="text-sm bg-background"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                       <DeleteHabitDialog habitName={habit.name} onDelete={() => onDelete(habit.id)}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteHabitDialog>
                        {hasPendingChanges && (
                            <Button onClick={handleSaveChanges}>
                                Guardar Cambios
                            </Button>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
