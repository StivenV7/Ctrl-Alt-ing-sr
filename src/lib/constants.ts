import { BookOpen, Dumbbell, HeartPulse, Shield, Star, Trophy } from 'lucide-react';
import type { Habit, Rank } from './types';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Leer 10 páginas',
    category: 'Crecimiento Personal',
    icon: BookOpen,
    completed: false,
    streak: 5,
    lastCompletedDate: '2024-07-20',
  },
  {
    id: 'habit-2',
    name: '30 minutos de ejercicio',
    category: 'Salud',
    icon: Dumbbell,
    completed: true,
    streak: 12,
    lastCompletedDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'habit-3',
    name: 'Meditar 5 minutos',
    category: 'Bienestar',
    icon: HeartPulse,
    completed: false,
    streak: 2,
    lastCompletedDate: '2024-07-18',
  },
];

export const RANKS: Rank[] = [
  { name: 'Novato', minXp: 0, icon: Shield },
  { name: 'Aprendiz', minXp: 10, icon: Shield },
  { name: 'Adepto', minXp: 30, icon: Star },
  { name: 'Maestro', minXp: 60, icon: Trophy },
  { name: 'Gran Maestro', minXp: 100, icon: Trophy },
];
