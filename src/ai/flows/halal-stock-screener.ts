'use server';

/**
 * @fileOverview A stock screener AI agent that determines if a stock complies with Islamic principles based on AAOIFI standards.
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
    z.boolean().describe('Whether the debt ratio (Interest-Bearing Debt / Market Cap < 30%) is compliant.'),
  securitiesRatioCompliant:
    z.boolean().describe('Whether the securities ratio (Interest-Bearing Securities / Market Cap < 30%) is compliant.'),
  purificationRequired: z.boolean().describe('Whether purification of impure income is required.'),
  purificationAmount: z.number().optional().describe('The amount of impure income to be purified.'),
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
  description: 'Returns the financial data of a stock, including debt, assets, and market capitalization.',
  inputSchema: z.object({
    ticker: z.string().describe('The ticker symbol of the stock.'),
  }),
  outputSchema: z.object({
    interestBearingDebt: z.number().describe('Total interest-bearing debt of the company.'),
    interestBearingSecurities: z.number().describe('Total interest-bearing securities of the company.'),
    marketCap: z.number().describe('Total market capitalization of the company.'),
    impureIncome: z.number().describe('Total impure income of the company.'),
    revenue: z.number().describe('Total revenue of the company.'),
  }),
  async (input) => {
    // Placeholder implementation - replace with actual financial data API
    console.log(`Fetching financial data for ${input.ticker}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const marketCap = Math.random() * 500e9 + 50e9; // 50B to 550B
    return {
      interestBearingDebt: marketCap * (Math.random() * 0.6), // 0-60% of market cap
      interestBearingSecurities: marketCap * (Math.random() * 0.6), // 0-60% of market cap
      marketCap: marketCap,
      revenue: marketCap * (Math.random() * 0.5 + 0.1), // 10-60% of market cap
      impureIncome: marketCap * (Math.random() * 0.1), // 0-10% of market cap
    };
  },
});

const getBusinessActivity = ai.defineTool({
  name: 'getBusinessActivity',
  description: 'Returns the primary business activity sector of a company.',
  inputSchema: z.object({
    ticker: z.string().describe('The ticker symbol of the stock.'),
  }),
  outputSchema: z.enum([
      'Technology',
      'Halal Food Production',
      'Healthcare',
      'Real Estate',
      'Alcohol',
      'Gambling',
      'Pork',
      'Conventional Finance',
      'Defense',
      'Media',
  ]),
  async (input) => {
    // Placeholder implementation - replace with actual business data API
    console.log(`Fetching business activity for ${input.ticker}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const activities = [
      'Technology',
      'Halal Food Production',
      'Healthcare',
      'Real Estate',
      'Alcohol',
      'Gambling',
      'Pork',
      'Conventional Finance',
      'Defense',
      'Media',
    ];
    return activities[Math.floor(Math.random() * activities.length)] as any;
  },
});

const prompt = ai.definePrompt({
  name: 'halalStockScreenerPrompt',
  tools: [getStockFinancials, getBusinessActivity],
  input: {schema: HalalStockScreenerInputSchema},
  output: {schema: HalalStockScreenerOutputSchema},
  prompt: `You are an expert in Islamic finance, strictly adhering to AAOIFI Shariah Standard 21. You are responsible for determining if a stock is halal.

Ticker: {{{ticker}}}

Follow these steps precisely:
1.  **Core Business Check:** Use the \`getBusinessActivity\` tool. If the sector is Alcohol, Gambling, Pork, Conventional Finance, or Media (impermissible content), the stock is HARAM. Set \`businessActivityCompliant\` to false and conclude the analysis.

2.  **Financial Ratios Check:** If the business is compliant, use the \`getStockFinancials\` tool to fetch financial data.
    *   **Ratio 1 (Debt):** Calculate (Total Interest-Bearing Debt / Market Cap). It must be LESS THAN 30% (0.30). Set \`debtRatioCompliant\` accordingly.
    *   **Ratio 2 (Securities):** Calculate (Interest-Bearing Securities / Market Cap). It must be LESS THAN 30% (0.30). Set \`securitiesRatioCompliant\` accordingly.

3.  **Income Purification Check:**
    *   Calculate (Impure Income / Revenue).
    *   If this ratio is >= 5% (0.05), the stock is HARAM.
    *   If the ratio is > 0% AND < 5%, the stock is HALAL, but requires purification. Set \`purificationRequired\` to true and set \`purificationAmount\` to the value of the Impure Income.
    *   If the ratio is 0%, set \`purificationRequired\` to false.

4.  **Final Verdict & Summary:**
    *   Set \`isHalal\` to true ONLY if \`businessActivityCompliant\`, \`debtRatioCompliant\`, and \`securitiesRatioCompliant\` are all true, AND the impure income ratio is less than 5%.
    *   Provide a clear summary explaining each check, the values used, the ratios calculated, and the final verdict. If purification is required, state it clearly.`,
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
