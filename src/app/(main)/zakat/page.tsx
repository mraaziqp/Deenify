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
      <div className="mb-6">
        <Card className="bg-yellow-50 border-yellow-300">
          <CardHeader>
            <CardTitle>South African Zakat Context</CardTitle>
            <CardDescription>
              <span className="font-semibold">Current Gold Nisab:</span> ~R130,000 (ZAR) <br />
              <span className="font-semibold">Current Silver Nisab:</span> ~R9,500 (ZAR) <br />
              <span className="font-semibold">Note:</span> Always check with your local Ulama for the latest rates and rulings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <ZakatCalculator />
        </CardContent>
      </Card>
    </div>
  );
}
