'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering questions about Islam based on the Quran and Sahih Hadith.
 *
 * - askAboutIslam - A function that processes user questions and returns AI-generated answers.
 * - AskAboutIslamInput - The input type for the askAboutIslam function.
 * - AskAboutIslamOutput - The return type for the askAboutIslam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAboutIslamInputSchema = z.object({
  question: z.string().describe('The question about Islam the user wants to ask.'),
});
export type AskAboutIslamInput = z.infer<typeof AskAboutIslamInputSchema>;

const AskAboutIslamOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question, based on Quran and Sahih Hadith.'),
});
export type AskAboutIslamOutput = z.infer<typeof AskAboutIslamOutputSchema>;

export async function askAboutIslam(input: AskAboutIslamInput): Promise<AskAboutIslamOutput> {
  return askAboutIslamFlow(input);
}

const askAboutIslamPrompt = ai.definePrompt({
  name: 'askAboutIslamPrompt',
  input: {schema: AskAboutIslamInputSchema},
  output: {schema: AskAboutIslamOutputSchema},
  prompt: `You are an AI assistant providing answers to questions about Islam.
Your answers must be based on the Quran and Sahih Hadith.
Adhere to strict Islamic guidelines and safety measures.

Question: {{{question}}}

Answer: `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const askAboutIslamFlow = ai.defineFlow(
  {
    name: 'askAboutIslamFlow',
    inputSchema: AskAboutIslamInputSchema,
    outputSchema: AskAboutIslamOutputSchema,
  },
  async input => {
    const {output} = await askAboutIslamPrompt(input);
    return output!;
  }
);
