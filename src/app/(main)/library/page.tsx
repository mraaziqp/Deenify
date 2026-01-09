import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Explore Islamic resources like courses and daily ayahs.
          </p>
        </div>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold">Feature Under Development</h3>
            <p className="text-muted-foreground mt-2">
                The content library is coming soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
