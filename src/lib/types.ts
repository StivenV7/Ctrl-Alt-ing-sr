import type { LucideIcon } from 'lucide-react';

export type Habit = {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon; // This is for client-side display only
  completed: boolean;
  streak: number;
  lastCompletedDate: string | null;
};

// This is the shape of the habit data stored in Firestore
export type FirestoreHabit = Omit<Habit, 'icon'>;

export type Rank = {
  name: string;
  minXp: number;
  icon: LucideIcon;
};
