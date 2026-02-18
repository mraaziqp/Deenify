"use client";
export const dynamic = "force-dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HalalScreenerForm } from "@/components/halal-screener-form";
import { TrendingUp } from "lucide-react";

export default function HalalScreenerPage() {
  return (
    <div className="container mx-auto">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Halal Stock Screener</CardTitle>
              <CardDescription>
                Enter a stock ticker to check for Sharia compliance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HalalScreenerForm />
        </CardContent>
      </Card>
    </div>
  );
}
