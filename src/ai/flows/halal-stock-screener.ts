'use server';

/**
 * @fileOverview A stock screener AI agent that determines if a stock complies with Islamic principles.
 *
 * - halalStockScreener - A function that screens stocks to check business activity and financial ratios.
 * - HalalStockScreenerInput - The input type for the halalStockScreener function.
 * - HalalStockScreenerOutput - The return type for the halalStockScreener function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HalalStockScreenerInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock to screen.'),
});
export type HalalStockScreenerInput = z.infer<typeof HalalStockScreenerInputSchema>;

const HalalStockScreenerOutputSchema = z.object({
  isHalal: z.boolean().describe('Whether the stock is halal (compliant with Islamic principles).'),
  businessActivityCompliant: z
    .boolean()
    .describe('Whether the primary business activity of the company is compliant.'),
  debtRatioCompliant:
    z.boolean().describe('Whether the debt ratio (debt < 33% of assets) is compliant.'),
  summary: z.string().describe('A summary of the analysis, including reasons for the determination.'),
});
export type HalalStockScreenerOutput = z.infer<typeof HalalStockScreenerOutputSchema>;

export async function halalStockScreener(input: HalalStockScreenerInput): Promise<
  HalalStockScreenerOutput
> {
  return halalStockScreenerFlow(input);
}

const getStockFinancials = ai.defineTool({
  name: 'getStockFinancials',
  description: 'Returns the financial data of a stock, including debt and assets.',
  inputSchema: z.object({
    ticker: z.string().describe('The ticker symbol of the stock.'),
  }),
  outputSchema: z.object({
    debt: z.number().describe('Total debt of the company.'),
    assets: z.number().describe('Total assets of the company.'),
  }),
  async (input) => {
    // Placeholder implementation - replace with actual data retrieval
    // In a real application, this would fetch data from a financial API
    console.log(`Fetching financial data for ${input.ticker}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    return {
      debt: Math.random() * 1000000000, // Example debt
      assets: Math.random() * 3000000000, // Example assets
    };
  },
});

const getBusinessActivity = ai.defineTool({
  name: 'getBusinessActivity',
  description: 'Returns the primary business activity of a company.',
  inputSchema: z.object({
    ticker: z.string().describe('The ticker symbol of the stock.'),
  }),
  outputSchema: z.string().describe('The primary business activity of the company.'),
  async (input) => {
    // Placeholder implementation - replace with actual data retrieval
    // In a real application, this would fetch data from a business data API
    console.log(`Fetching business activity for ${input.ticker}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    const activities = [
      'Software Development',
      'Islamic Banking',
      'Conventional Banking',
      'Alcohol Production',
      'Defense',
      'Halal Food Production',
    ];
    return activities[Math.floor(Math.random() * activities.length)]; // Return random activity
  },
});

const prompt = ai.definePrompt({
  name: 'halalStockScreenerPrompt',
  tools: [getStockFinancials, getBusinessActivity],
  input: {schema: HalalStockScreenerInputSchema},
  output: {schema: HalalStockScreenerOutputSchema},
  prompt: `You are an expert in Islamic finance.  You are responsible for determining if a stock is halal (Sharia-compliant).

To do this, you must first determine the primary business activity of the company.  If the company is involved in any haram (forbidden) activities such as alcohol, gambling, interest-based finance, or weapons manufacturing, then the stock is not halal.

Second, you must determine if the company's debt ratio is compliant.  The debt ratio is calculated as total debt / total assets.  If the debt ratio is greater than 33%, then the stock is not halal.

Use the getBusinessActivity tool to determine the company's primary business activity, and use the getStockFinancials tool to get the company's financial data.

Ticker: {{{ticker}}}`,
});

const halalStockScreenerFlow = ai.defineFlow(
  {
    name: 'halalStockScreenerFlow',
    inputSchema: HalalStockScreenerInputSchema,
    outputSchema: HalalStockScreenerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
