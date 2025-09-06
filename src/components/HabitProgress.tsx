
'use client';

import type { Habit, HabitEntry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Flame, Trash2, PlusCircle, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { calculateStreak } from '@/lib/utils';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

type HabitProgressProps = {
    habit: Habit;
    onAddNewEntry: (habitId: string) => void;
    onUpdateEntry: (habitId: string, entryDate: string, newValues: Partial<HabitEntry>) => void;
    onDelete: (habitId: string) => void;
};

export function HabitProgress({ habit, onAddNewEntry, onUpdateEntry, onDelete }: HabitProgressProps) {
    const { entries, duration } = habit;
    
    // Entries sorted with main entries first, then by date descending
    const sortedEntries = useMemo(() => 
        [...entries].sort((a, b) => {
            const dateA = parseISO(a.date);
            const dateB = parseISO(b.date);
            
            if (!isSameDay(dateA, dateB)) {
                return dateB.getTime() - dateA.getTime();
            }
            
            // if dates are same, non-extras come first
            return (a.isExtra ? 1 : 0) - (b.isExtra ? 1 : 0);
        }), 
    [entries]);

    const mainDayEntries = useMemo(() => entries.filter(e => !e.isExtra), [entries]);
    const dayCount = mainDayEntries.length;
    const completedCount = useMemo(() => entries.filter(e => e.completed && !e.isExtra).length, [entries]);
    const progressPercentage = useMemo(() => (dayCount / duration) * 100, [dayCount, duration]);
    const streak = useMemo(() => calculateStreak(entries).count, [entries]);

    const handleJournalChange = (date: string, isExtra: boolean | undefined, index: number, value: string) => {
        onUpdateEntry(habit.id, date, { journal: value });
    };

    const handleCompletionChange = (date: string, isExtra: boolean | undefined, index: number, checked: boolean) => {
        onUpdateEntry(habit.id, date, { completed: checked });
    };

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
                            <p>Día {dayCount}/{habit.duration}</p>
                            <Progress value={progressPercentage} className="h-2 mt-1" />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-4">{habit.description}</p>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {sortedEntries.length > 0 ? sortedEntries.map((entry, index) => {
                             const mainDayEntryIndex = mainDayEntries.findIndex(e => isSameDay(parseISO(e.date), parseISO(entry.date)));
                             const dayNumber = mainDayEntries.length - mainDayEntryIndex;
                             return (
                                <div key={`${entry.date}-${index}`} className="p-3 rounded-md bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {entry.isExtra ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger><Star className="h-4 w-4 text-yellow-500"/></TooltipTrigger>
                                                        <TooltipContent><p>Entrada Extra</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <h4 className="font-semibold">Día {dayNumber}</h4>
                                            )}
                                            <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "d 'de' MMMM", { locale: es })}</p>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`check-${habit.id}-${entry.date}-${index}`}
                                                checked={entry.completed}
                                                onCheckedChange={(checked) => handleCompletionChange(entry.date, entry.isExtra, index, !!checked)}
                                            />
                                            <label htmlFor={`check-${habit.id}-${entry.date}-${index}`} className='text-sm'>Completado</label>
                                        </div>
                                    </div>
                                    <Textarea
                                        id={`journal-${habit.id}-${entry.date}-${index}`}
                                        placeholder="¿Qué aprendiste? ¿Cómo te sentiste?"
                                        defaultValue={entry.journal}
                                        onBlur={(e) => handleJournalChange(entry.date, entry.isExtra, index, e.target.value)}
                                        className="text-sm bg-background mt-2 resize-none"
                                        rows={2}
                                    />
                                </div>
                             )
                        }) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>¡Es hora de empezar!</p>
                                <p className="text-sm">Pulsa el botón de abajo para registrar tu primer día.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <Button onClick={() => onAddNewEntry(habit.id)}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Registrar Avance
                        </Button>
                       <DeleteHabitDialog habitName={habit.name} onDelete={() => onDelete(habit.id)}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteHabitDialog>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

    