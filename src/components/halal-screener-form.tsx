'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { halalStockScreener, type HalalStockScreenerOutput } from '@/ai/flows/halal-stock-screener';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const FormSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required.').max(10),
});

export function HalalScreenerForm() {
  const [result, setResult] = useState<HalalStockScreenerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ticker: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await halalStockScreener({ ticker: data.ticker.toUpperCase() });
      setResult(response);
    } catch (e) {
      setError('An error occurred while screening the stock. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }
  
  const ComplianceBadge = ({ compliant }: { compliant: boolean }) => (
    compliant ? (
      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">
        <CheckCircle className="h-4 w-4 mr-1" />
        Compliant
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-4 w-4 mr-1" />
        Not Compliant
      </Badge>
    )
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="ticker"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only">Stock Ticker</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., AAPL, MSFT" {...field} className="text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="h-10">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Screen'}
          </Button>
        </form>
      </Form>

      {error && (
        <div className="flex items-center gap-2 text-destructive-foreground bg-destructive p-3 rounded-md">
            <AlertTriangle className="h-5 w-5"/>
            <p>{error}</p>
        </div>
      )}

      {result && (
        <Card className="bg-background/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <span>Screening Result for {form.getValues('ticker').toUpperCase()}</span>
              {result.isHalal ? (
                <Badge className="bg-green-600 text-white hover:bg-green-700 text-base">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Halal
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-base">
                  <XCircle className="mr-2 h-5 w-5" />
                  Not Halal
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <span className="font-medium">Business Activity</span>
                    <ComplianceBadge compliant={result.businessActivityCompliant} />
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <span className="font-medium">Interest-Bearing Debt Ratio (&lt; 30%)</span>
                    <ComplianceBadge compliant={result.debtRatioCompliant} />
                </div>
                 <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <span className="font-medium">Interest-Bearing Securities Ratio (&lt; 30%)</span>
                    <ComplianceBadge compliant={result.securitiesRatioCompliant} />
                </div>
            </div>
             {result.purificationRequired && (
              <div className="flex items-start gap-3 text-amber-900 bg-amber-100 p-3 rounded-md border border-amber-200">
                  <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                  <div>
                      <h4 className='font-semibold'>Purification Required</h4>
                      <p className='text-sm'>
                          This stock is considered Halal, but it has some impure income. To purify your investment, you should donate 
                          <span className='font-bold'> ${result.purificationAmount?.toFixed(2)}</span> for every share you own annually.
                      </p>
                  </div>
              </div>
            )}
            <div>
              <h4 className="font-semibold mb-2">Summary:</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{result.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
