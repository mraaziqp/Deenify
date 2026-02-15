'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, RefreshCw } from 'lucide-react';

/**
 * Development-only component for quickly testing different user roles.
 * This component should be removed or hidden in production.
 * 
 * Usage: Add to layout or any page during development:
 * ```
 * <DevRoleSwitcher />
 * ```
 */
export function DevRoleSwitcher() {
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [showMessage, setShowMessage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRoleSwitch = () => {
    // Show instruction message
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Don't render until client is mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg border-2 border-yellow-400 bg-yellow-50 z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-4 w-4 text-yellow-700" />
        <span className="font-semibold text-sm text-yellow-900">
          🔧 Dev Role Switcher
        </span>
        <Badge variant="outline" className="text-xs">DEV ONLY</Badge>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">👨‍🎓 Student</SelectItem>
              <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
              <SelectItem value="verifier">✅ Verifier</SelectItem>
              <SelectItem value="admin">👑 Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={handleRoleSwitch}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {showMessage && (
          <div className="text-xs bg-white border border-yellow-300 rounded p-2">
            <p className="font-medium mb-1">To test <strong>{selectedRole}</strong> role:</p>
            <ol className="list-decimal pl-4 space-y-1 text-yellow-900">
              <li>Open <code className="bg-yellow-100 px-1 rounded">src/lib/auth-context.tsx</code></li>
              <li>Find line ~29 (mockUser object)</li>
              <li>Change <code className="bg-yellow-100 px-1 rounded">role: 'student'</code></li>
              <li>Set to <code className="bg-yellow-100 px-1 rounded">role: '{selectedRole}'</code></li>
              <li>Save file (auto-refresh)</li>
            </ol>
          </div>
        )}

        <div className="text-xs text-yellow-800 space-y-1">
          <p><strong>Student:</strong> Dashboard, Library, Profile</p>
          <p><strong>Teacher:</strong> + Teacher Portal</p>
          <p><strong>Verifier:</strong> + Verifier Dashboard</p>
          <p><strong>Admin:</strong> Full access</p>
        </div>
      </div>
    </Card>
  );
}
