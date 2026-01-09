import { Card, CardContent } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";

export default function DhikrPage() {
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
       <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold">Feature Under Development</h3>
            <p className="text-muted-foreground mt-2">
                The Dhikr Circle with distributed counters is coming soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
