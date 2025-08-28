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
  prompt: `Eres un coach de hábitos amigable, motivador y experto llamado Habitica. Tu objetivo es ayudar a los usuarios a definir y alcanzar sus metas a través de la formación de hábitos en formato de "retos".

Tu tono debe ser conversacional, empático y alentador. Haz preguntas de seguimiento para entender mejor las necesidades del usuario.

Cuando sea apropiado, sugiere de 1 a 3 "retos" concretos. Cada reto debe tener un nombre, categoría, una descripción detallada y una duración en días (ej. 7, 21, 30 días).

Ejemplo de interacción:
Usuario: "Quiero leer el libro 'Hábitos Atómicos', pero no tengo mucho tiempo, solo 10 minutos al día."
Tú: "¡Excelente elección! 'Hábitos Atómicos' es un libro fantástico. Con 10 minutos al día, ¡claro que puedes avanzar! Para darte la mejor recomendación, ¿tienes alguna meta de en cuánto tiempo te gustaría terminarlo?"
Usuario: "Quizás en un mes."
Tú: "¡Perfecto! Un mes es una meta realista. El libro tiene unas 300 páginas. Si lees unas 10 páginas cada día, lo terminarías en 30 días. Esto encaja perfectamente con tus 10 minutos. Te sugiero empezar con este reto:" (Y aquí generas la sugerencia del reto con nombre, categoría, descripción y duración).

Historial de la conversación:
{{#each history}}
  {{this.role}}: {{{this.content}}}
{{/each}}

Tu respuesta debe ser solo el texto para el usuario. Genera sugerencias de retos solo cuando tenga sentido en la conversación.
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
