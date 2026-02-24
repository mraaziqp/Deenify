"use client";
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SoloWorshipTab from './solo-tab';
import CommunityWorshipTab from './community-tab';

export default function WorshipDashboard() {
  const [tab, setTab] = useState('solo');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Worship Dashboard</h1>
      <div className="flex justify-center mb-8">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex gap-4 bg-emerald-50 rounded-full p-2 shadow">
            <TabsTrigger value="solo" className="text-lg font-semibold px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400">Solo</TabsTrigger>
            <TabsTrigger value="community" className="text-lg font-semibold px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="solo">
            <SoloWorshipTab />
          </TabsContent>
          <TabsContent value="community">
            <CommunityWorshipTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
