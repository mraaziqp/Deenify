'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering questions about Islam.
 * Enhanced with proper error handling and debugging for production deployment.
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
  try {
    console.log('[askAboutIslam] Starting flow with question:', input.question);
    // Check API key is available
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error('[askAboutIslam] ERROR: No API key found in environment');
      return {
        answer: 'I am currently offline. Did you know the Prophet (SAW) advised breaking the fast with fresh dates?'
      };
    }
    console.log('[askAboutIslam] API key found, invoking flow...');
    const result = await askAboutIslamFlow(input);
    console.log('[askAboutIslam] Flow completed successfully');
    return result;
  } catch (error) {
    console.error('[askAboutIslam] ERROR occurred:', error);
    return {
      answer: 'I am currently offline. Did you know the Prophet (SAW) advised breaking the fast with fresh dates?'
    };
  }
}

// This is the prompt that will be sent to the LLM.
// TODO: Implement RAG with Firestore retriever after database setup
const askAboutIslamPrompt = ai.definePrompt({
  name: 'askAboutIslamPrompt',
  input: {schema: AskAboutIslamInputSchema},
  output: {schema: AskAboutIslamOutputSchema},
  system: "You are Deenify, a knowledgeable and compassionate Islamic tutor serving Muslims in South Africa. Answer the user's question about Islam based on your knowledge of Islamic teachings, the Quran, Hadith, and Islamic jurisprudence. Be respectful, accurate, and helpful. Provide references where possible. Do not issue fatwas, but provide general Islamic knowledge and guidance. When discussing financial matters, remember that South Africa uses the Rand (ZAR) currency.",
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
