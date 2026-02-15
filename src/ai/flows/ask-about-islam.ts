'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering questions about Islam.
 * Currently uses direct LLM response. RAG with Firestore will be implemented after database setup.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAboutIslamInputSchema = z.object({
  question: z.string().describe('The question about Islam the user wants to ask.'),
});
export type AskAboutIslamInput = z.infer<typeof AskAboutIslamInputSchema>;

const AskAboutIslamOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type AskAboutIslamOutput = z.infer<typeof AskAboutIslamOutputSchema>;

export async function askAboutIslam(input: AskAboutIslamInput): Promise<AskAboutIslamOutput> {
  return askAboutIslamFlow(input);
}

// This is the prompt that will be sent to the LLM.
// TODO: Implement RAG with Firestore retriever after database setup
const askAboutIslamPrompt = ai.definePrompt({
  name: 'askAboutIslamPrompt',
  input: {schema: AskAboutIslamInputSchema},
  output: {schema: AskAboutIslamOutputSchema},
  system: "You are Deenify, a knowledgeable and compassionate Islamic tutor. Answer the user's question about Islam based on your knowledge of Islamic teachings, the Quran, Hadith, and Islamic jurisprudence. Be respectful, accurate, and helpful. Do not issue fatwas, but provide general Islamic knowledge.",
  prompt: `Question: {{{question}}}

Please provide a thoughtful and accurate Islamic answer to this question.`,
  config: {
    // Safety settings aligned with Islamic values
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

// Main flow for answering Islam questions
const askAboutIslamFlow = ai.defineFlow(
  {
    name: 'askAboutIslamFlow',
    inputSchema: AskAboutIslamInputSchema,
    outputSchema: AskAboutIslamOutputSchema,
  },
  async (input) => {
    // Call the LLM with the prompt
    const {output} = await askAboutIslamPrompt(input);
    return output!;
  }
);
