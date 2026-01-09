import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { CircleDollarSign } from "lucide-react";

export default function ZakatPage() {
  return (
    <div className="container mx-auto">
       <div className="flex items-center gap-3 mb-4">
            <CircleDollarSign className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Zakat Calculator</h1>
              <p className="text-muted-foreground">
                A comprehensive tool to calculate your Zakat and purify your wealth.
              </p>
            </div>
        </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <ZakatCalculator />
        </CardContent>
      </Card>
    </div>
  );
}
