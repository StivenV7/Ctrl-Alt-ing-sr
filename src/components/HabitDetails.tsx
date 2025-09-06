
'use client';

import { useState, useMemo } from 'react';
import type { Habit, HabitEntry } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Flame, Trash2, BookText } from 'lucide-react';
import { format, parseISO, startOfDay, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateStreak } from '@/lib/utils';


type HabitDetailsProps = {
    habit: Habit;
    onUpdate: (habitId: string, entries: HabitEntry[]) => void;
    onDelete: (habitId: string) => void;
};

export function HabitDetails({ habit, onUpdate, onDelete }: HabitDetailsProps) {
    const initialEntries = useMemo(() => habit.entries || [], [habit.entries]);
    const [entries, setEntries] = useState<HabitEntry[]>(initialEntries);
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(startOfDay(new Date()));

    const handleSaveChanges = () => {
        // Since changes are now applied instantly, this can be used when the accordion closes
        const hasChanges = JSON.stringify(initialEntries) !== JSON.stringify(entries);
        if (hasChanges) {
            onUpdate(habit.id, entries);
        }
    };
    
    const startDate = useMemo(() => initialEntries.length > 0 ? parseISO(initialEntries[0].date) : startOfDay(new Date()), [initialEntries]);
    const endDate = useMemo(() => addDays(startDate, habit.duration - 1), [startDate, habit.duration]);

    const completedDays = useMemo(() => entries.filter(e => e.completed).map(e => parseISO(e.date)), [entries]);
    const journalDays = useMemo(() => entries.filter(e => e.journal && e.journal.trim() !== '').map(e => parseISO(e.date)), [entries]);

    const completedCount = useMemo(() => completedDays.length, [completedDays]);
    const progressPercentage = useMemo(() => (completedCount / (habit.duration || 1)) * 100, [completedCount, habit.duration]);
    const streak = useMemo(() => calculateStreak(entries).count, [entries]);

    const selectedEntry = useMemo(() => {
        if (!selectedDay) return undefined;
        return entries.find(e => isSameDay(parseISO(e.date), selectedDay));
    }, [selectedDay, entries]);

    const handleDayClick = (day: Date | undefined) => {
        if (day && !isAfter(day, startOfDay(new Date()))) {
            setSelectedDay(day);
        }
    }
    
    const handleEntryChange = (date: string, newValues: Partial<HabitEntry>) => {
        const updatedEntries = entries.map(entry => 
            entry.date === date ? { ...entry, ...newValues } : entry
        );
        setEntries(updatedEntries);
        onUpdate(habit.id, updatedEntries); // Update instantly
    };


    return (
        <Accordion type="single" collapsible className="w-full" onValueChange={handleSaveChanges}>
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
                            <p>Día {completedCount}/{habit.duration || 'N/A'}</p>
                            <Progress value={progressPercentage} className="h-2 mt-1" />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-4">{habit.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-md border flex justify-center">
                            <TooltipProvider>
                                <Calendar
                                    mode="single"
                                    selected={selectedDay}
                                    onSelect={handleDayClick}
                                    month={selectedDay}
                                    onMonthChange={setSelectedDay}
                                    fromDate={startDate}
                                    toDate={endDate}
                                    disabled={(date) => isAfter(date, startOfDay(new Date()))}
                                    locale={es}
                                    modifiers={{ 
                                        completed: completedDays,
                                        journal: journalDays
                                    }}
                                    modifiersClassNames={{
                                        completed: "bg-primary/80 text-primary-foreground rounded-full",
                                        journal: "bg-transparent",
                                    }}
                                    components={{
                                        DayContent: ({ date, ...props }) => {
                                            const hasJournal = journalDays.some(d => isSameDay(d, date));
                                            return (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative flex items-center justify-center h-full w-full">
                                                            <span>{format(date, 'd')}</span>
                                                            {hasJournal && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-accent-foreground"></div>}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {hasJournal && (
                                                        <TooltipContent>
                                                            <p className="font-bold">Tu Experiencia:</p>
                                                            <p className="max-w-xs">{entries.find(e => isSameDay(parseISO(e.date), date))?.journal}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            );
                                        }
                                    }}
                                />
                            </TooltipProvider>
                        </div>

                        <div className="flex flex-col gap-2 p-3 rounded-md bg-muted/50">
                            {selectedEntry ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg">{format(parseISO(selectedEntry.date), "EEEE, d 'de' MMMM", { locale: es })}</h4>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`check-${habit.id}-${selectedEntry.date}`}
                                                checked={selectedEntry.completed}
                                                onCheckedChange={(checked) => handleEntryChange(selectedEntry.date, { completed: !!checked })}
                                            />
                                            <label htmlFor={`check-${habit.id}-${selectedEntry.date}`}>Completado</label>
                                        </div>
                                    </div>
                                    <div className="flex-grow flex flex-col gap-2">
                                        <label htmlFor={`journal-${habit.id}-${selectedEntry.date}`} className="flex items-center gap-2 font-medium text-sm"><BookText className="h-4 w-4"/> Tu Experiencia</label>
                                        <Textarea
                                            id={`journal-${habit.id}-${selectedEntry.date}`}
                                            placeholder="¿Qué aprendiste? ¿Cómo te sentiste?"
                                            value={selectedEntry.journal}
                                            onChange={(e) => handleEntryChange(selectedEntry.date, { journal: e.target.value })}
                                            className="text-sm bg-background flex-grow resize-none"
                                            rows={6}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>Selecciona un día.</p>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex justify-end items-center mt-4 pt-4 border-t">
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
