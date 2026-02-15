'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookMarked, Share2, Heart } from 'lucide-react';
import { getDailyHadith } from '@/lib/hadith-collection';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function DailyHadithCard() {
  const hadith = getDailyHadith();
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Hadith - Deenify',
          text: `${hadith.english}\n\n— ${hadith.narrator}\n${hadith.source}, ${hadith.reference}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${hadith.english}\n\n— ${hadith.narrator}\n${hadith.source}, ${hadith.reference}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Wisdom of the Day</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {hadith.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className="text-base md:text-lg italic border-l-4 border-primary pl-4 py-2">
          "{hadith.english}"
        </blockquote>
        
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold">— {hadith.narrator}</p>
          <p className="text-xs mt-1">
            {hadith.source}, {hadith.reference}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
