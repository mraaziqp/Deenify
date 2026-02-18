export const dynamic = "force-dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function WasiyaPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <ScrollText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Wasiya (Will) Generator</h1>
          <p className="text-muted-foreground">
            Create a legally valid Islamic will based on the Fara'id Algorithm.
          </p>
        </div>
      </div>
       <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold">Feature Under Development</h3>
            <p className="text-muted-foreground mt-2">
                The Wasiya generator is coming soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
