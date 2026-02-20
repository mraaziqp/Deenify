'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calculator } from 'lucide-react';

const ZAKAT_RATE = 0.025; // 2.5%
const NISAB_GOLD_GRAMS = 87.48; // Standard Nisab for gold
const NISAB_SILVER_GRAMS = 612.36; // Standard Nisab for silver
// South African Estimates (updated periodically)
const ESTIMATED_ZAR_GOLD_NISAB = 130000; // ≈ R130,000
const ESTIMATED_ZAR_SILVER_NISAB = 9500; // ≈ R9,500

const ZakatSchema = z.object({
  goldPricePerGram: z.coerce.number().min(0, 'Must be positive'),
  silverPricePerGram: z.coerce.number().min(0, 'Must be positive'),
  goldGrams: z.coerce.number().min(0).default(0),
  silverGrams: z.coerce.number().min(0).default(0),
  cashInHand: z.coerce.number().min(0).default(0),
  cashInBank: z.coerce.number().min(0).default(0),
  stocksPassive: z.coerce.number().min(0).default(0),
  stocksActive: z.coerce.number().min(0).default(0),
  crypto: z.coerce.number().min(0).default(0),
  shortTermDebts: z.coerce.number().min(0).default(0),
  otherDebts: z.coerce.number().min(0).default(0),
});

type ZakatFormData = z.infer<typeof ZakatSchema>;

function CurrencyInput({ field, label, description }: { field: any, label: string, description?: string }) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-semibold">R</span>
          <Input type="number" placeholder="0.00" className="pl-7" {...field} />
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

export function ZakatCalculator() {
  // ...existing code...
  const [showBelowNisab, setShowBelowNisab] = useState(false);
  const resetForm = () => form.reset();
  const [nisab, setNisab] = useState(0);
  const [zakatDue, setZakatDue] = useState(0);

  const form = useForm<ZakatFormData>({
    resolver: zodResolver(ZakatSchema),
    defaultValues: {
      goldPricePerGram: 1485, // R1,485 per gram (South African estimate)
      silverPricePerGram: 15.5, // R15.50 per gram (South African estimate)
      goldGrams: 0,
      silverGrams: 0,
      cashInHand: 0,
      cashInBank: 0,
      stocksPassive: 0,
      stocksActive: 0,
      crypto: 0,
      shortTermDebts: 0,
      otherDebts: 0,
    },
  });

  const watchAllFields = form.watch();

  const { totalAssets, totalLiabilities, netAssets } = useMemo(() => {
    const values = form.getValues();
    const goldValue = values.goldGrams * values.goldPricePerGram;
    const silverValue = values.silverGrams * values.silverPricePerGram;

    const totalAssets =
      goldValue +
      silverValue +
      values.cashInHand +
      values.cashInBank +
      values.stocksPassive +
      values.stocksActive +
      values.crypto;
    
    const totalLiabilities = values.shortTermDebts + values.otherDebts;
    const netAssets = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netAssets };
  }, [watchAllFields, form]);
  
  useEffect(() => {
    const goldNisab = watchAllFields.goldPricePerGram * NISAB_GOLD_GRAMS;
    const silverNisab = watchAllFields.silverPricePerGram * NISAB_SILVER_GRAMS;
    setNisab(Math.min(goldNisab, silverNisab));
    setShowBelowNisab(netAssets < Math.min(goldNisab, silverNisab));
  }, [watchAllFields.goldPricePerGram, watchAllFields.silverPricePerGram, netAssets]);


  const calculateZakat = () => {
    if (netAssets >= nisab) {
      setZakatDue(netAssets * ZAKAT_RATE);
    } else {
      setZakatDue(0);
    }
  };

  return (
    <Tabs defaultValue="zakat" className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-lg">
        <TabsTrigger value="zakat">Zakat Calculator</TabsTrigger>
        <TabsTrigger value="purification">Income Purification</TabsTrigger>
      </TabsList>
      <TabsContent value="zakat" className="p-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold mb-2 text-primary">How to Use the Zakah Calculator</h2>
          <ul className="list-disc pl-6 text-sm text-blue-900">
            <li>Enter your gold/silver prices and amounts.</li>
            <li>Fill in your cash, investments, and crypto assets.</li>
            <li>Add any debts due within a year.</li>
            <li>Click <b>Calculate Zakat</b> to see your summary.</li>
            <li>If your net assets are below the Nisab threshold, Zakat is not due.</li>
          </ul>
        </div>
        <Form {...form}>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Assets */}
            <div className="md:col-span-2 grid gap-6">
              <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <FormItem>
                  <FormLabel>Gold Price / gram (ZAR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('goldPricePerGram')} />
                  </FormControl>
                  <FormDescription>Current SA estimate: R1,485/g</FormDescription>
                </FormItem>
                <FormItem>
                  <FormLabel>Silver Price / gram (ZAR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...form.register('silverPricePerGram')} />
                  </FormControl>
                  <FormDescription>Current SA estimate: R15.50/g</FormDescription>
                </FormItem>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Assets</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="goldGrams" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Gold (grams)</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="silverGrams" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Silver (grams)</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="cashInHand" render={({ field }) => <CurrencyInput field={field} label="Cash in Hand" />} />
                  <FormField control={form.control} name="cashInBank" render={({ field }) => <CurrencyInput field={field} label="Cash in Bank Accounts" />} />
                  <FormField control={form.control} name="stocksPassive" render={({ field }) => <CurrencyInput field={field} label="Stocks (Passive Investment)" description="Market value of shares." />} />
                  <FormField control={form.control} name="stocksActive" render={({ field }) => <CurrencyInput field={field} label="Stocks (Active Trading)" description="Market value of shares." />} />
                  <FormField control={form.control} name="crypto" render={({ field }) => <CurrencyInput field={field} label="Cryptocurrency" description="Current market value." />} />
                </div>
              </div>

               <div className="space-y-4">
                <h3 className="font-semibold text-lg">Liabilities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="shortTermDebts" render={({ field }) => <CurrencyInput field={field} label="Short-term Debts" description="Debts due within one year." />} />
                    <FormField control={form.control} name="otherDebts" render={({ field }) => <CurrencyInput field={field} label="Other Immediate Debts" />} />
                </div>
              </div>

            </div>

            {/* Summary */}
            <div className="md:col-span-1 space-y-4">
              <div className="p-6 bg-muted rounded-lg space-y-4 sticky top-24">
                <h3 className="font-semibold text-lg text-center">Your Zakat Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Assets</span> <span>R{totalAssets.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Liabilities</span> <span>-R{totalLiabilities.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span >Net Zakatable Assets</span> <span>R{netAssets.toFixed(2)}</span></div>
                </div>
                {showBelowNisab && (
                  <div className="bg-yellow-100 text-yellow-800 rounded p-2 text-center text-sm mt-2">
                    <AlertCircle className="inline mr-1 h-4 w-4" />
                    Your net assets are below the Nisab threshold. Zakat is not due.
                  </div>
                )}
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground">Nisab Threshold (Silver)</p>
                  <p className="font-bold text-primary">R{nisab.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Est. R9,500 - R130,000</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={calculateZakat} className="w-full">
                    <Calculator className="mr-2 h-4 w-4" /> Calculate Zakat
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="w-full">Reset</Button>
                </div>
                <div className="text-center p-4 border-t border-dashed mt-4">
                    <p className="text-muted-foreground">Zakat Due (2.5%)</p>
                    <p className="text-3xl font-bold text-primary">R{zakatDue.toFixed(2)}</p>
                    {zakatDue > 0 && <p className="text-xs text-muted-foreground mt-2">May Allah accept your Zakat</p>}
                </div>
              </div>
            </div>
          </div>
        </Form>
      </TabsContent>
      <TabsContent value="purification" className="p-6">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-blue-500"/>
          <h3 className="text-xl font-semibold">Purification of Impure Income</h3>
          <p className="text-muted-foreground">
            This tool helps you calculate the amount to give away to purify wealth obtained from impermissible sources. This feature is under development.
          </p>
          <Button disabled>Coming Soon</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
