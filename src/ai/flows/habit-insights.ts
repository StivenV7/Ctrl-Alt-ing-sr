// src/ai/flows/generate-habit-plan.ts
'use server';
/**
 * @fileOverview A flow to generate a personalized habit plan based on user goals.
 *
 * - generateHabitPlan - A function that takes user goals and returns a suggested habit plan.
 * - GenerateHabitPlanInput - The input type for the generateHabitPlan function.
 * - GenerateHabitPlanOutput - The return type for the generateHabitPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHabitPlanInputSchema = z.object({
  userGoals: z.string().describe('The user-provided goals.'),
});
export type GenerateHabitPlanInput = z.infer<typeof GenerateHabitPlanInputSchema>;

const GenerateHabitPlanOutputSchema = z.object({
  habits: z.array(
    z.object({
      name: z.string().describe('The name of the suggested habit.'),
      category: z.string().describe('The category for the habit (e.g., Salud, Productividad, Creatividad).'),
    })
  ).describe('An array of suggested habit objects.'),
});
export type GenerateHabitPlanOutput = z.infer<typeof GenerateHabitPlanOutputSchema>;

export async function generateHabitPlan(input: GenerateHabitPlanInput): Promise<GenerateHabitPlanOutput> {
  return generateHabitPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHabitPlanPrompt',
  input: {schema: GenerateHabitPlanInputSchema},
  output: {schema: GenerateHabitPlanOutputSchema},
  prompt: `Eres un coach de productividad y bienestar. Basado en las metas del usuario, crea un plan de 3 a 5 hábitos accionables y relevantes.

  Metas del usuario: {{{userGoals}}}

  Para cada hábito, proporciona un nombre claro y una categoría apropiada (ej: Salud, Productividad, Creatividad, Bienestar, Finanzas).
  Responde únicamente con el formato JSON especificado.
`,
});

const generateHabitPlanFlow = ai.defineFlow(
  {
    name: 'generateHabitPlanFlow',
    inputSchema: GenerateHabitPlanInputSchema,
    outputSchema: GenerateHabitPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
