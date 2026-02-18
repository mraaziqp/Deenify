'use client';
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Trash2, RefreshCw, Plus, Search, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function FactsAdminPage() {
  const { user, isLoading, hasRole } = useAuth();
  const [customFacts, setCustomFacts] = useState<string[]>([]);
  const [useCustomFacts, setUseCustomFacts] = useState(false);
  const [newFact, setNewFact] = useState('');
  const [search, setSearch] = useState('');
  const [defaultCount, setDefaultCount] = useState(0);

  useEffect(() => {
    const storedFacts = JSON.parse(localStorage.getItem('customFacts') || '[]');
    const storedUseCustom = localStorage.getItem('useCustomFacts') === 'true';
    setCustomFacts(Array.isArray(storedFacts) ? storedFacts : []);
    setUseCustomFacts(storedUseCustom);

    const loadDefaultCount = async () => {
      try {
        const response = await fetch('/api/facts');
        if (!response.ok) return;
        const data = await response.json();
        setDefaultCount(Array.isArray(data.facts) ? data.facts.length : 0);
      } catch (error) {
        console.error('Failed to load default facts:', error);
      }
    };

    void loadDefaultCount();
  }, []);

  const filteredFacts = useMemo(() => {
    if (!search.trim()) {
      return customFacts.map((fact, index) => ({ fact, index }));
    }
    const query = search.toLowerCase();
    return customFacts
      .map((fact, index) => ({ fact, index }))
      .filter((item) => item.fact.toLowerCase().includes(query));
  }, [customFacts, search]);

  const persistFacts = (facts: string[], useCustom: boolean) => {
    setCustomFacts(facts);
    localStorage.setItem('customFacts', JSON.stringify(facts));
    localStorage.setItem('useCustomFacts', String(useCustom));
  };

  const handleToggleCustom = (checked: boolean) => {
    setUseCustomFacts(checked);
    localStorage.setItem('useCustomFacts', String(checked));
    toast.success(checked ? 'Using custom facts' : 'Using default facts');
  };

  const handleAddFact = () => {
    const trimmed = newFact.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...customFacts];
    persistFacts(updated, true);
    setUseCustomFacts(true);
    setNewFact('');
    toast.success('Fact added');
  };

  const handleUpdateFact = (index: number, value: string) => {
    const updated = [...customFacts];
    updated[index] = value;
    persistFacts(updated, useCustomFacts);
  };

  const handleDeleteFact = (index: number) => {
    const updated = [...customFacts];
    updated.splice(index, 1);
    persistFacts(updated, useCustomFacts);
    toast.success('Fact removed');
  };

  const handleReset = () => {
    persistFacts([], false);
    setUseCustomFacts(false);
    toast.success('Custom facts cleared');
  };

  const handleSeedDefaults = async () => {
    try {
      const response = await fetch('/api/facts');
      if (!response.ok) {
        toast.error('Failed to load default facts');
        return;
      }
      const data = await response.json();
      const facts = Array.isArray(data.facts) ? data.facts : [];
      if (facts.length === 0) {
        toast.error('No default facts found');
        return;
      }
      persistFacts(facts, true);
      setUseCustomFacts(true);
      toast.success('Default facts copied to custom list');
    } catch (error) {
      console.error('Failed to seed facts:', error);
      toast.error('Failed to copy default facts');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !hasRole('admin')) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">Access Restricted</h2>
              <p className="text-sm text-muted-foreground">
                Only administrators can manage daily facts.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Facts Admin</h1>
          <p className="text-muted-foreground">
            Manage daily Islamic facts and control what learners see.
          </p>
        </div>
        <Badge variant="outline">Default facts: {defaultCount}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Custom Facts Settings</CardTitle>
          <CardDescription>
            Custom facts are stored locally in this browser and override defaults.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-facts-toggle">Use custom facts</Label>
            <Switch
              id="custom-facts-toggle"
              checked={useCustomFacts}
              onCheckedChange={handleToggleCustom}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleSeedDefaults} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Copy Defaults to Custom
            </Button>
            <Button onClick={handleReset} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Custom Facts
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Fact</CardTitle>
          <CardDescription>Short, accurate, and easy to remember facts work best.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={newFact}
            onChange={(event) => setNewFact(event.target.value)}
            placeholder="Enter a new Islamic fact..."
            rows={3}
          />
          <Button onClick={handleAddFact}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fact
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Facts</CardTitle>
          <CardDescription>Search, edit, or remove facts in your custom list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search facts..."
              className="pl-10"
            />
          </div>

          {filteredFacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No facts found.</p>
          ) : (
            <div className="space-y-3">
              {filteredFacts.map((item) => {
                const { fact, index } = item;
                return (
                  <Card key={`fact-${index}`} className="border-muted">
                    <CardContent className="pt-4 space-y-3">
                      <Textarea
                        value={fact}
                        onChange={(event) => handleUpdateFact(index, event.target.value)}
                        rows={2}
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteFact(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
