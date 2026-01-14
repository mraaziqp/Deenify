'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering questions about Islam using Retrieval-Augmented Generation (RAG).
 *
 * - askAboutIslam - A function that processes user questions, retrieves relevant Hadiths, and returns an AI-generated answer.
 * - AskAboutIslamInput - The input type for the askAboutIslam function.
 * - AskAboutIslamOutput - The return type for the askAboutIslam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  defineFirestoreRetriever,
  firestoreVectorRetriever,
} from '@genkit-ai/google-genai';

const AskAboutIslamInputSchema = z.object({
  question: z.string().describe('The question about Islam the user wants to ask.'),
});
export type AskAboutIslamInput = z.infer<typeof AskAboutIslamInputSchema>;

const AskAboutIslamOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question, based on retrieved knowledge.'),
});
export type AskAboutIslamOutput = z.infer<typeof AskAboutIslamOutputSchema>;

export async function askAboutIslam(input: AskAboutIslamInput): Promise<AskAboutIslamOutput> {
  return askAboutIslamFlow(input);
}

// This defines the retriever for our knowledge base.
// We are telling Genkit where to look for the data and what field contains the content.
const hadithKnowledgeRetriever = defineFirestoreRetriever({
    name: 'hadithKnowledgeRetriever',
    collection: 'knowledge_nodes',
    contentField: 'content.en',
});


// This is the prompt that will be sent to the LLM.
// It includes a system instruction and the user's question.
// Crucially, it uses a Handlebars helper `retrieve` to perform the RAG lookup.
const askAboutIslamPrompt = ai.definePrompt({
  name: 'askAboutIslamPrompt',
  input: {schema: AskAboutIslamInputSchema},
  output: {schema: AskAboutIslamOutputSchema},
  system: "You are Deenify, a gentle Islamic tutor. Answer the user's question using only the context provided below. Cite the Hadith number if available. Do not give fatwas.",
  prompt: `QUESTION: {{{question}}}

CONTEXT:
{{#each (await retrieve from hadithKnowledgeRetriever with question)}}
  - {{document.content}} (Sahih al-Bukhari {{document.metadata.hadith_number}})
{{/each}}
`,
  config: {
    // Safety settings to prevent harmful content, aligned with Islamic values.
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

// This is the main flow that orchestrates the RAG process.
const askAboutIslamFlow = ai.defineFlow(
  {
    name: 'askAboutIslamFlow',
    inputSchema: AskAboutIslamInputSchema,
    outputSchema: AskAboutIslamOutputSchema,
  },
  async (input) => {
    // Step 1: Retrieval Guardrail
    // We manually retrieve documents first to check the similarity score.
    const documents = await firestoreVectorRetriever({
      collection: 'knowledge_nodes',
      contentField: 'content.en',
      vectorField: 'embedding', // Assumes embedding field from previous steps
    })(input.question, {k: 3});

    // Filter out documents with a score below our confidence threshold.
    const validDocs = documents.filter(doc => doc.score >= 0.6);

    // If no sufficiently relevant documents are found, return a polite refusal.
    if (validDocs.length === 0) {
        return {
            answer: "I can only answer questions based on the Quran and Sahih Bukhari. I did not find a direct reference for this in my current knowledge base."
        };
    }
    
    // Step 2: Synthesis
    // Pass the validated documents as context to the prompt.
    const {output} = await askAboutIslamPrompt(input, {
      context: validDocs.map(d => d.document)
    });
    
    return output!;
  }
);
