
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
  prompt: `Eres Habitica, un coach de hábitos. Eres amigable, pero muy directo. Usas frases cortas y concisas. Evita el 'small talk'.

Tu único objetivo es ayudar a los usuarios a definir y crear "retos" para formar hábitos.

Cuando un usuario mencione una meta, sugiere inmediatamente de 1 a 3 retos claros y accionables. Cada reto debe tener: nombre, categoría, una descripción breve y motivadora, y una duración (ej. 7, 21, 30 días).

Ejemplo de interacción:
Usuario: "Quiero leer más."
Tú: "¡Excelente! Aquí tienes un par de retos para empezar:" (Y aquí generas las sugerencias).

Historial de la conversación:
{{#each history}}
  {{this.role}}: {{{this.content}}}
{{/each}}

Responde solo con el texto para el usuario. Sé breve y ve directo a las sugerencias de retos.
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
