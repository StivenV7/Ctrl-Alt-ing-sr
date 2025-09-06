
'use client';

import type { Habit, HabitEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog';
import { HabitEntryDisplay } from './HabitEntryDisplay';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


import { Flame, Trash2, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { calculateStreak } from '@/lib/utils';
import { parseISO, isSameDay } from 'date-fns';

type HabitProgressProps = {
    habit: Habit;
    onAddNewEntry: (habitId: string) => void;
    onUpdateEntry: (habitId: string, entryDate: string, newValues: Partial<HabitEntry>) => void;
    onDelete: (habitId: string) => void;
    isNewlyAdded: boolean;
};

const ENTRIES_VISIBLE_BY_DEFAULT = 5;

export function HabitProgress({ habit, onAddNewEntry, onUpdateEntry, onDelete, isNewlyAdded }: HabitProgressProps) {
    const { entries, duration } = habit;
    const [isOpen, setIsOpen] = useState(isNewlyAdded);
    const [showAllEntries, setShowAllEntries] = useState(false);
    
    const sortedEntries = useMemo(() => 
        [...entries].sort((a, b) => {
            const dateA = parseISO(a.date);
            const dateB = parseISO(b.date);
            
            if (!isSameDay(dateA, dateB)) {
                return dateB.getTime() - dateA.getTime();
            }
            
            // For same-day entries, non-extra comes before extra
            return (a.isExtra ? 1 : 0) - (b.isExtra ? 1 : 0);
        }), 
    [entries]);

    const mainDayEntries = useMemo(() => entries.filter(e => !e.isExtra), [entries]);
    const dayCount = mainDayEntries.length;
    const progressPercentage = useMemo(() => (dayCount / duration) * 100, [dayCount, duration]);
    const streak = useMemo(() => calculateStreak(entries).count, [entries]);
    
    const visibleEntries = showAllEntries ? sortedEntries : sortedEntries.slice(0, ENTRIES_VISIBLE_BY_DEFAULT);

    // This useEffect handles opening the collapsible when a new habit is added
    useEffect(() => {
        setIsOpen(isNewlyAdded);
    }, [isNewlyAdded]);


    return (
        <Collapsible 
            open={isOpen} 
            onOpenChange={setIsOpen}
            className="border rounded-lg mb-4 shadow-sm"
        >
            <CollapsibleTrigger asChild>
                 <div className="p-4 cursor-pointer">
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
                            <div className="h-2 mt-1 bg-secondary rounded-full w-full">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                 </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground my-4">{habit.description}</p>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {visibleEntries.length > 0 ? visibleEntries.map((entry, index) => (
                        <HabitEntryDisplay
                            key={`${entry.date}-${entry.isExtra}-${index}`}
                            entry={entry}
                            index={index}
                            habitId={habit.id}
                            mainDayEntries={mainDayEntries}
                            onUpdateEntry={onUpdateEntry}
                        />
                    )) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>¡Es hora de empezar!</p>
                            <p className="text-sm">Pulsa el botón de abajo para registrar tu primer día.</p>
                        </div>
                    )}
                </div>

                {sortedEntries.length > ENTRIES_VISIBLE_BY_DEFAULT && (
                     <div className="text-center mt-4">
                        <Button variant="ghost" onClick={() => setShowAllEntries(!showAllEntries)}>
                            {showAllEntries ? 'Mostrar menos' : 'Ver historial completo'}
                        </Button>
                    </div>
                )}

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
            </CollapsibleContent>
        </Collapsible>
    );
}
