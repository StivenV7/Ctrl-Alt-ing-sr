
'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, Circle, Star } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { HabitEntry } from '@/lib/types';

interface HabitEntryDisplayProps {
  entry: HabitEntry;
  index: number;
  habitId: string;
  mainDayEntries: HabitEntry[];
  onUpdateEntry: (habitId: string, entryDate: string, newValues: Partial<HabitEntry>) => void;
}

export function HabitEntryDisplay({ entry, index, habitId, mainDayEntries, onUpdateEntry }: HabitEntryDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [journalText, setJournalText] = useState(entry.journal || '');

  const handleToggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const handleSaveAndClose = () => {
    onUpdateEntry(habitId, entry.date, { journal: journalText, completed: true });
    setIsOpen(false);
  };

  const mainDayEntryIndex = mainDayEntries.findIndex(e => isSameDay(parseISO(e.date), parseISO(entry.date)));
  const dayNumber = mainDayEntries.length - mainDayEntryIndex;

  return (
    <div className="p-3 rounded-md bg-muted/50">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={handleToggleOpen}
      >
        <div className="flex items-center gap-2">
            <div className="font-semibold flex items-center gap-2">
                {entry.isExtra ? (
                    <>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500"/>
                        <span>Avance Extra del Día {dayNumber}</span>
                    </>
                ) : (
                    <>
                        <Circle className={`h-3 w-3 ${entry.completed ? 'fill-green-500 text-green-500' : 'fill-muted-foreground text-muted-foreground'}`}/>
                        <span>Día {dayNumber}</span>
                    </>
                )}
            </div>
            <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "d 'de' MMMM", { locale: es })}</p>
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="¿Qué aprendiste? ¿Cómo te sentiste?"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="text-sm bg-background resize-none"
            rows={3}
          />
          <Button size="sm" onClick={handleSaveAndClose}>
            Guardar y Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}
