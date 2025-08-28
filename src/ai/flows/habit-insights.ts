// src/ai/flows/habit-insights.ts
'use server';
/**
 * @fileOverview A flow to provide personalized tips and suggestions based on habit tracking data.
 *
 * - getHabitInsights - A function that takes habit tracking data and returns personalized insights.
 * - HabitInsightsInput - The input type for the getHabitInsights function.
 * - HabitInsightsOutput - The return type for the getHabitInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HabitInsightsInputSchema = z.object({
  habits: z.array(
    z.object({
      name: z.string().describe('The name of the habit.'),
      category: z.string().describe('The category of the habit (e.g., health, work, personal).'),
      completed: z.boolean().describe('Whether the habit was completed today.'),
      streak: z.number().describe('The current streak of consecutive days the habit has been completed.'),
    })
  ).describe('An array of habit objects, each containing the name, category, completion status, and streak of the habit.'),
  userGoals: z.string().describe('The user provided goals.'),
});
export type HabitInsightsInput = z.infer<typeof HabitInsightsInputSchema>;

const HabitInsightsOutputSchema = z.object({
  insights: z.array(
    z.object({
      habitName: z.string().describe('The name of the habit the insight is related to.'),
      suggestion: z.string().describe('A personalized tip or suggestion for improving consistency with the habit.'),
    })
  ).describe('An array of insights, each containing the habit name and a personalized suggestion.'),
});
export type HabitInsightsOutput = z.infer<typeof HabitInsightsOutputSchema>;

export async function getHabitInsights(input: HabitInsightsInput): Promise<HabitInsightsOutput> {
  return habitInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'habitInsightsPrompt',
  input: {schema: HabitInsightsInputSchema},
  output: {schema: HabitInsightsOutputSchema},
  prompt: `You are a helpful AI assistant designed to provide personalized tips and suggestions for improving habit consistency.

  Analyze the user's habit tracking data and provide specific, actionable suggestions for improving their consistency and achieving their goals.

  Here is the user's habit tracking data:
  User Goals: {{{userGoals}}}
  Habits:
  {{#each habits}}
  - Name: {{name}}, Category: {{category}}, Completed Today: {{completed}}, Streak: {{streak}}
  {{/each}}

  Provide insights that will help the user improve their consistency and achieve their goals.
  Each insight MUST include the habit name and a personalized suggestion.
  Use information like streak, whether or not the habit was completed today, and the user's stated goals to generate your suggestions.
`,
});

const habitInsightsFlow = ai.defineFlow(
  {
    name: 'habitInsightsFlow',
    inputSchema: HabitInsightsInputSchema,
    outputSchema: HabitInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
