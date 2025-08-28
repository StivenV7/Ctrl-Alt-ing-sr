import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

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

// Schema for AI chat suggestions
export const HabitSuggestionSchema = z.object({
    name: z.string().describe('The name of the suggested habit.'),
    category: z.string().describe('The category for the habit (e.g., Health, Productivity, Creativity).'),
});

// Schema for a single chat message
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  suggestions: z.array(HabitSuggestionSchema).optional().describe('Actionable habit suggestions, if any.'),
});

// Type for a single chat message
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Input schema for the chat flow
export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Output schema for the chat flow
export const ChatOutputSchema = z.object({
  answer: z.string().describe('The AI coach\'s response.'),
  suggestions: z.array(HabitSuggestionSchema).optional().describe('A list of actionable habits suggested by the AI.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
