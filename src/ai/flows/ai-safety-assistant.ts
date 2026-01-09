'use server';

/**
 * @fileOverview An AI assistant that answers questions about Islam based on approved Islamic texts, with a 'Fatwa Firewall' to avoid complex rulings.
 *
 * - askAboutIslam - A function that handles the question answering process.
 * - AskAboutIslamInput - The input type for the askAboutIslam function.
 * - AskAboutIslamOutput - The return type for the askAboutIslam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAboutIslamInputSchema = z.object({
  question: z.string().describe('The question about Islam.'),
});
export type AskAboutIslamInput = z.infer<typeof AskAboutIslamInputSchema>;

const AskAboutIslamOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on approved Islamic texts.'),
  sources: z.array(z.string()).describe('The sources used to answer the question.'),
});
export type AskAboutIslamOutput = z.infer<typeof AskAboutIslamOutputSchema>;

export async function askAboutIslam(input: AskAboutIslamInput): Promise<AskAboutIslamOutput> {
  return askAboutIslamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAboutIslamPrompt',
  input: {schema: AskAboutIslamInputSchema},
  output: {schema: AskAboutIslamOutputSchema},
  prompt: `You are a helpful AI assistant that answers questions about Islam based on the Quran and Sahih Hadith.

  Adhere to the following guidelines:
  - Only provide answers based on approved Islamic texts.
  - Avoid complex rulings (Fatwa Firewall).
  - Provide sources for your answers.

  Question: {{{question}}}

  Answer:`, // Keep it open-ended, the model will populate the fields based on output schema.
});

const askAboutIslamFlow = ai.defineFlow(
  {
    name: 'askAboutIslamFlow',
    inputSchema: AskAboutIslamInputSchema,
    outputSchema: AskAboutIslamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
