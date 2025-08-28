import type { LucideIcon } from 'lucide-react';

export type Habit = {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  completed: boolean;
  streak: number;
  lastCompletedDate: string | null;
};

export type Rank = {
  name: string;
  minXp: number;
  icon: LucideIcon;
};
