"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export default function TaraweehPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Taraweeh Tracker
          </CardTitle>
          <Badge variant="secondary" className="mt-2">Ramadan Special</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg">Track your Taraweeh prayers this Ramadan. Mark each night as completed and see your progress!</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="font-bold">Night {i + 1}</span>
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">May Allah accept your prayers and efforts this Ramadan!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
