
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';


// A daily entry for a habit challenge
export const HabitEntrySchema = z.object({
  date: z.string().describe('The date for the entry in YYYY-MM-DD format.'),
  completed: z.boolean().describe('Whether the habit was completed on this date.'),
  journal: z.string().optional().describe('A user-written journal entry for the day.'),
});
export type HabitEntry = z.infer<typeof HabitEntrySchema>;

export type Habit = {
  id: string;
  name: string;
  category: string;
  description: string; // Detailed description of the habit/challenge
  icon: LucideIcon; // This is for client-side display only
  duration: number; // Duration of the challenge in days
  entries: HabitEntry[]; // Record of daily progress
  // DEPRECATED properties, will be calculated from entries
  completed?: boolean; 
  streak?: number;
  lastCompletedDate?: string | null;
};

// This is the shape of the habit data stored in Firestore
export type FirestoreHabit = Omit<Habit, 'icon' | 'completed' | 'streak' | 'lastCompletedDate'>;

export type Rank = {
  name: string;
  minXp: number;
  icon: LucideIcon;
};

// Schema for AI chat suggestions for detailed habits/challenges
export const HabitSuggestionSchema = z.object({
    name: z.string().describe('The name of the suggested habit challenge.'),
    category: z.string().describe('The category for the habit (e.g., Health, Productivity, Creativity).'),
    description: z.string().describe("A detailed description of the habit and why it's beneficial."),
    duration: z.number().describe('The suggested duration for the challenge in days (e.g., 7, 21, 30).'),
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
  suggestions: z.array(HabitSuggestionSchema).optional().describe('A list of actionable habit challenges suggested by the AI.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// FORUM TYPES

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface ForumMessage {
  id: string;
  content: string;
  timestamp: Timestamp;
  userId: string;
  userName: string;
  userImage: string | null;
  categoryId: string;
}

export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string | null;
  theme: 'light' | 'blue' | 'pink';
  xp: number;
  habits: FirestoreHabit[];
  followedCategoryIds: string[];
  role: 'user' | 'admin';
  gender?: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  description: string;
  requestedBy: string; // userId
  requestedByName: string; // userName for display
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}
