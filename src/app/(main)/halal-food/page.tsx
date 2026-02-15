'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Search, AlertCircle, Apple } from 'lucide-react';

interface FoodItem {
  name: string;
  category: string;
  status: 'halal' | 'caution' | 'haram';
  description: string;
}

const halalFoods: FoodItem[] = [
  // Halal Foods
  {
    name: 'Chicken',
    category: 'Meat',
    status: 'halal',
    description: 'When slaughtered Islamically with Bismillah',
  },
  {
    name: 'Lamb',
    category: 'Meat',
    status: 'halal',
    description: 'When slaughtered Islamically with Bismillah',
  },
  {
    name: 'Beef',
    category: 'Meat',
    status: 'halal',
    description: 'When slaughtered Islamically with Bismillah',
  },
  {
    name: 'Fish',
    category: 'Seafood',
    status: 'halal',
    description: 'All fish with scales are halal',
  },
  {
    name: 'Shrimp',
    category: 'Seafood',
    status: 'halal',
    description: 'Permissible in most Islamic schools',
  },
  {
    name: 'Dates',
    category: 'Fruits',
    status: 'halal',
    description: 'Highly recommended and blessed',
  },
  {
    name: 'Olive Oil',
    category: 'Oils',
    status: 'halal',
    description: 'Pure and highly recommended in Islam',
  },
  {
    name: 'Honey',
    category: 'Natural Sweeteners',
    status: 'halal',
    description: 'Blessed and mentioned in the Quran',
  },
  {
    name: 'Whole Wheat Bread',
    category: 'Grains',
    status: 'halal',
    description: 'Natural and wholesome grain product',
  },
  {
    name: 'Rice',
    category: 'Grains',
    status: 'halal',
    description: 'Staple food, pure and halal',
  },
  {
    name: 'Vegetables',
    category: 'Vegetables',
    status: 'halal',
    description: 'All natural vegetables are halal',
  },
  {
    name: 'Milk',
    category: 'Dairy',
    status: 'halal',
    description: 'Pure dairy products are halal',
  },
  {
    name: 'Cheese',
    category: 'Dairy',
    status: 'halal',
    description: 'When made with halal ingredients only',
  },
  {
    name: 'Eggs',
    category: 'Protein',
    status: 'halal',
    description: 'Excellent source of halal protein',
  },
  {
    name: 'Nuts & Seeds',
    category: 'Snacks',
    status: 'halal',
    description: 'Natural and beneficial food',
  },

  // Caution Foods
  {
    name: 'Gelatin',
    category: 'Additives',
    status: 'caution',
    description: 'Must verify source - often from non-halal animals',
  },
  {
    name: 'Shellfish (No Scales)',
    category: 'Seafood',
    status: 'caution',
    description: 'Differs by Islamic school - check with scholars',
  },
  {
    name: 'Food Coloring',
    category: 'Additives',
    status: 'caution',
    description: 'Must check source and ingredients',
  },
  {
    name: 'Processed Meats',
    category: 'Meat',
    status: 'caution',
    description: 'Check for non-halal additives and preservatives',
  },
  {
    name: 'Margarine',
    category: 'Fats',
    status: 'caution',
    description: 'Often contains non-halal ingredients - verify',
  },

  // Haram Foods
  {
    name: 'Pork & Pork Products',
    category: 'Meat',
    status: 'haram',
    description: 'Explicitly forbidden in Quran (2:173)',
  },
  {
    name: 'Alcohol & Alcoholic Beverages',
    category: 'Beverages',
    status: 'haram',
    description: 'Explicitly forbidden in Quran (5:90)',
  },
  {
    name: 'Carnivorous Animals',
    category: 'Meat',
    status: 'haram',
    description: 'Animals with fangs - lion, tiger, etc.',
  },
  {
    name: 'Birds of Prey',
    category: 'Meat',
    status: 'haram',
    description: 'Birds with talons - hawk, eagle, etc.',
  },
  {
    name: 'Blood',
    category: 'Meat',
    status: 'haram',
    description: 'Explicitly forbidden in Quran',
  },
  {
    name: 'Dead Animals (not slaughtered)',
    category: 'Meat',
    status: 'haram',
    description: 'Carrion is forbidden (Quran 2:173)',
  },
  {
    name: 'Intoxicants in Food',
    category: 'Additives',
    status: 'haram',
    description: 'Any food with intoxicating amounts',
  },
];

export default function HalalFoodPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'halal' | 'caution' | 'haram'>('all');

  const categories = Array.from(new Set(halalFoods.map(f => f.category)));

  const filteredFoods = halalFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedCategory === 'all' || food.status === selectedCategory;
    return matchesSearch && matchesStatus;
  });

  const halalCount = halalFoods.filter(f => f.status === 'halal').length;
  const cautionCount = halalFoods.filter(f => f.status === 'caution').length;
  const haramCount = halalFoods.filter(f => f.status === 'haram').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'halal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'caution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'haram':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'halal':
        return <CheckCircle className="h-4 w-4" />;
      case 'caution':
        return <AlertCircle className="h-4 w-4" />;
      case 'haram':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Halal Food Guide</h1>
        <p className="text-muted-foreground">
          Comprehensive guide to permissible and impermissible foods in Islam
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Halal Foods</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{halalCount}</div>
            <p className="text-xs text-muted-foreground">Foods permissible to eat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caution Foods</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cautionCount}</div>
            <p className="text-xs text-muted-foreground">Verify before consuming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Haram Foods</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{haramCount}</div>
            <p className="text-xs text-muted-foreground">Forbidden to consume</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Foods</CardTitle>
          <CardDescription>Find information about specific foods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All Foods</TabsTrigger>
              <TabsTrigger value="halal">
                <CheckCircle className="h-4 w-4 mr-2" />
                Halal
              </TabsTrigger>
              <TabsTrigger value="caution">
                <AlertCircle className="h-4 w-4 mr-2" />
                Caution
              </TabsTrigger>
              <TabsTrigger value="haram">
                <AlertCircle className="h-4 w-4 mr-2" />
                Haram
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Food List by Category */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryFoods = filteredFoods.filter(f => f.category === category);
          if (categoryFoods.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryFoods.map((food, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="pt-1">
                        {getStatusIcon(food.status)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{food.name}</p>
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${getStatusColor(food.status)}`}
                          >
                            {food.status.charAt(0).toUpperCase() + food.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{food.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Islamic Guidelines */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-teal-600" />
            Islamic Dietary Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Halal (ح):</strong> Permissible foods that are pure and beneficial. Foods must be from permissible sources and prepared in accordance with Islamic law.
          </p>
          <p>
            <strong>Haram (ح):</strong> Forbidden foods explicitly mentioned in the Quran and Sunnah. Consuming haram food is a grave sin.
          </p>
          <p>
            <strong>Mashbooh (م):</strong> Doubtful foods where the status is unclear. It is better to avoid doubtful foods as per Islamic teaching.
          </p>
          <p className="text-muted-foreground italic">
            "And eat of that on which the name of Allah has been mentioned, if you believe in His verses." - Quran 6:118
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
