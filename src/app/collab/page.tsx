"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Room {
  id: string;
  title: string;
  type: string;
  targetCount: number;
  currentCount: number;
  status: string;
}

export default function CollabLobby() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    // TODO: Replace with actual fetch from API
    setRooms([
      { id: 'r1', title: 'Friday Surah Yaseen Sync', type: 'YASEEN', targetCount: 83, currentCount: 12, status: 'ACTIVE' },
      { id: 'r2', title: 'Global Astaghfirullah Challenge (Goal: 10,000)', type: 'DHIKR', targetCount: 10000, currentCount: 3200, status: 'ACTIVE' },
      { id: 'r3', title: 'Ramadan Khatm Room', type: 'KHATM', targetCount: 30, currentCount: 8, status: 'OPEN' },
    ]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Live Ummah Collaboration Lobby</h1>
      <div className="flex justify-end mb-6">
        <Link href="/collab/create">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Create a Room</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map(room => (
          <Link key={room.id} href={`/collab/room/${room.id}`} className="block bg-white rounded-lg shadow-lg p-6 hover:ring-2 hover:ring-emerald-400 transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-emerald-700">{room.title}</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">{room.type}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Goal: <span className="font-bold">{room.targetCount}</span></span>
              <span className="text-gray-700">Current: <span className="font-bold">{room.currentCount}</span></span>
              <span className={`text-xs font-bold rounded px-2 py-0.5 ${room.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : room.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{room.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
