'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'General';
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Alt', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['Alt', 'Q'], description: 'Go to Quran', category: 'Navigation' },
  { keys: ['Alt', 'H'], description: 'Go to Dhikr Circle', category: 'Navigation' },
  { keys: ['Alt', 'K'], description: 'Go to Khatm', category: 'Navigation' },
  { keys: ['Alt', 'C'], description: 'Go to Courses', category: 'Navigation' },
  { keys: ['Alt', 'Z'], description: 'Go to Zakat Calculator', category: 'Navigation' },
  { keys: ['Alt', 'A'], description: 'Go to AI Assistant', category: 'Navigation' },
  
  // Actions
  { keys: ['Space'], description: 'Increment Dhikr (on Dhikr page)', category: 'Actions' },
  { keys: ['R'], description: 'Reset Dhikr counter', category: 'Actions' },
  { keys: ['P'], description: 'Play/Pause Quran audio', category: 'Actions' },
  
  // General
  { keys: ['Escape'], description: 'Close dialogs/modals', category: 'General' },
  { keys: ['?'], description: 'Show this help', category: 'General' },
];

export function KeyboardShortcutsDialog() {
  const categories = ['Navigation', 'Actions', 'General'] as const;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Keyboard className="h-4 w-4 mr-2" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and interact with Deenify faster
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {categories.map((category) => {
            const categoryShortcuts = shortcuts.filter(s => s.category === category);
            return (
              <div key={category}>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <Badge
                            key={keyIdx}
                            variant="secondary"
                            className="font-mono text-xs px-2 py-1"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Press <Badge variant="secondary" className="mx-1 font-mono">?</Badge> 
            anywhere in the app to see this help dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
