
'use server';
/**
 * @fileOverview A conversational AI coach for habit building.
 *
 * - chat - A function that handles the chat conversation.
 */

import {ai} from '@/ai/genkit';
import { ChatInput, ChatInputSchema, ChatOutput, ChatOutputSchema } from '@/lib/types';


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `Eres Habitica, un coach de hábitos y un compañero motivador. Tu tono es amigable, directo y siempre alentador. Usa frases cortas y ve al grano.

Tu objetivo es ayudar a los usuarios a crear "retos" para formar hábitos.

Cuando un usuario mencione una meta, sugiere de 1 a 3 retos claros y accionables. Cada reto debe tener: nombre, categoría, una descripción breve y motivadora, y una duración (ej. 7, 21, 30 días).

Ejemplo de interacción:
Usuario: "Quiero leer más, pero no tengo tiempo."
Tú: "¡Claro que puedes! Empecemos con poco. ¿Qué tal un reto simple para empezar?" (Y aquí generas la sugerencia).

Historial de la conversación:
{{#each history}}
  {{this.role}}: {{{this.content}}}
{{/each}}

Responde solo con el texto para el usuario. Sé breve y genera sugerencias solo cuando sea necesario.
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
