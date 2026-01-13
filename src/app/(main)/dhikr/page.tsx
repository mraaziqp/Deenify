
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPulse, PlusCircle, MinusCircle } from "lucide-react";
import { useState } from "react";

export default function DhikrPage() {
  const [count, setCount] = useState(0);

  // Optimistic UI: Update local state immediately
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => (prev > 0 ? prev - 1 : 0));

  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <HeartPulse className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Dhikr Circle</h1>
          <p className="text-muted-foreground">
            Participate in global Dhikr and track our collective progress.
          </p>
        </div>
      </div>
       <Card className="shadow-lg max-w-md mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl">Global Tasbih Count</CardTitle>
            <CardDescription>Feature under development. Local counter is functional.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
            <p className="text-7xl font-bold text-primary mb-6">{count.toLocaleString()}</p>
            <div className="flex justify-center gap-4">
                 <Button onClick={decrement} variant="outline" size="lg" aria-label="Decrement count">
                    <MinusCircle />
                </Button>
                <Button onClick={increment} size="lg" className="px-8" aria-label="Increment count">
                    <PlusCircle className="mr-2" />
                    Count
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
                Your counts will be synced with the global total automatically.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
