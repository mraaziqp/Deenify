import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleUser } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <CircleUser className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences.
          </p>
        </div>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold">Feature Under Development</h3>
            <p className="text-muted-foreground mt-2">
                The user profile page is coming soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
