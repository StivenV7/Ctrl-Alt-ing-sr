
'use client';

import type { Habit, HabitEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Flame, Trash2, PlusCircle, Star, ChevronDown, Circle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
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
    
    const sortedEntries = useMemo(() => 
        [...entries].sort((a, b) => {
            const dateA = parseISO(a.date);
            const dateB = parseISO(b.date);
            
            if (!isSameDay(dateA, dateB)) {
                return dateB.getTime() - dateA.getTime();
            }
            
            return (a.isExtra ? 1 : 0) - (b.isExtra ? 1 : 0);
        }), 
    [entries]);

    const [openEntries, setOpenEntries] = useState<string[]>([]);

    useEffect(() => {
        // Automatically open the latest entry when the component mounts or entries change
        if (sortedEntries.length > 0) {
            const latestEntryKey = `${sortedEntries[0].date}-${sortedEntries[0].isExtra ? 'extra' : 'main'}-${0}`;
            if (!openEntries.includes(latestEntryKey)) {
                setOpenEntries([latestEntryKey]);
            }
        }
    }, [entries]); // Intentionally not including sortedEntries or openEntries to avoid loops

    const mainDayEntries = useMemo(() => entries.filter(e => !e.isExtra), [entries]);
    const dayCount = mainDayEntries.length;
    const progressPercentage = useMemo(() => (dayCount / duration) * 100, [dayCount, duration]);
    const streak = useMemo(() => calculateStreak(entries).count, [entries]);

    const handleToggleOpen = (key: string) => {
        setOpenEntries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const handleSaveAndClose = (key: string, date: string, journal: string) => {
        onUpdateEntry(habit.id, date, { journal, completed: true });
        handleToggleOpen(key);
    };

    return (
        <div className="border rounded-lg mb-4 shadow-sm p-4">
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
            
            <p className="text-sm text-muted-foreground my-4">{habit.description}</p>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {sortedEntries.length > 0 ? sortedEntries.map((entry, index) => {
                    const entryKey = `${entry.date}-${entry.isExtra ? 'extra' : 'main'}-${index}`;
                    const isOpen = openEntries.includes(entryKey);
                    const mainDayEntryIndex = mainDayEntries.findIndex(e => isSameDay(parseISO(e.date), parseISO(entry.date)));
                    const dayNumber = mainDayEntries.length - mainDayEntryIndex;
                    const [journalText, setJournalText] = useState(entry.journal || '');

                    return (
                        <div key={entryKey} className="p-3 rounded-md bg-muted/50">
                            <div 
                                className="flex items-center justify-between cursor-pointer" 
                                onClick={() => handleToggleOpen(entryKey)}
                            >
                                <div className="flex items-center gap-2">
                                    {entry.isExtra ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger><Star className="h-4 w-4 text-yellow-500"/></TooltipTrigger>
                                                <TooltipContent><p>Entrada Extra</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Circle className={`h-3 w-3 ${entry.completed ? 'fill-green-500 text-green-500' : 'fill-muted-foreground text-muted-foreground'}`}/>
                                            Día {dayNumber}
                                        </h4>
                                    )}
                                    <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "d 'de' MMMM", { locale: es })}</p>
                                </div>
                                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isOpen && (
                                <div className="mt-3 space-y-2">
                                    <Textarea
                                        id={`journal-${entryKey}`}
                                        placeholder="¿Qué aprendiste? ¿Cómo te sentiste?"
                                        value={journalText}
                                        onChange={(e) => setJournalText(e.target.value)}
                                        className="text-sm bg-background resize-none"
                                        rows={3}
                                    />
                                    <Button size="sm" onClick={() => handleSaveAndClose(entryKey, entry.date, journalText)}>
                                        Guardar y Cerrar
                                    </Button>
                                </div>
                            )}
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
        </div>
    );
}
