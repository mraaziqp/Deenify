'use client';
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
// import { Badge } from '@/components/ui/badge';
// import { Label } from '@/components/ui/label';
// import { Trash2, RefreshCw, Plus, Search, ShieldAlert } from 'lucide-react';
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
      <div>Loading...</div>
    );
  }

  if (!user || !hasRole('admin')) {
    return (
      <div>
        <h2>Access Restricted</h2>
        <p>Only administrators can manage daily facts.</p>
        <a href="/dashboard">Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Daily Facts Admin (UI temporarily disabled for build test)</h1>
      <p>Default facts: {defaultCount}</p>
      <p>Custom facts enabled: {String(useCustomFacts)}</p>
      <p>Custom facts count: {customFacts.length}</p>
      <button onClick={handleSeedDefaults}>Copy Defaults to Custom</button>
      <button onClick={handleReset}>Clear Custom Facts</button>
      <input value={newFact} onChange={e => setNewFact(e.target.value)} placeholder="Enter a new Islamic fact..." />
      <button onClick={handleAddFact}>Add Fact</button>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facts..." />
      <ul>
        {filteredFacts.map(item => (
          <li key={item.index}>
            <input value={item.fact} onChange={e => handleUpdateFact(item.index, e.target.value)} />
            <button onClick={() => handleDeleteFact(item.index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
