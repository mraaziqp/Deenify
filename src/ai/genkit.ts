import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use Gemini 1.5 Flash as it's fast and capable for RAG.
  model: 'googleai/gemini-1.5-flash',
});
