import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserCircle, CheckCircle } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Room {
  id: string;
  title: string;
  type: string;
  targetCount: number;
  currentCount: number;
  status: string;
  participants: Participant[];
}

export default function CollabRoom() {
  const params = useParams();
  const roomId = params?.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [count, setCount] = useState(0);
  const [milestone, setMilestone] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual fetch from API and Pusher real-time sync
    setRoom({
      id: roomId,
      title: 'Friday Surah Yaseen Sync',
      type: 'YASEEN',
      targetCount: 83,
      currentCount: 12,
      status: 'ACTIVE',
      participants: [
        { id: 'u1', name: 'Ali', avatarUrl: '' },
        { id: 'u2', name: 'Fatima', avatarUrl: '' },
        { id: 'u3', name: 'Yusuf', avatarUrl: '' },
      ],
    });
    setCount(12);
  }, [roomId]);

  function handleCount() {
    // TODO: Replace with Pusher event
    setCount(c => {
      const newCount = c + 1;
      if (newCount % 100 === 0) setMilestone(true);
      return newCount;
    });
  }

  useEffect(() => {
    if (milestone) {
      // Play chime
      const audio = new Audio('/chime.mp3');
      audio.play();
      setTimeout(() => setMilestone(false), 2000);
    }
  }, [milestone]);

  if (!room) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4 text-center">{room.title}</h1>
      <div className="flex justify-center gap-6 mb-6">
        <span className="text-lg">Goal: <span className="font-bold">{room.targetCount}</span></span>
        <span className="text-lg">Current: <span className="font-bold">{count}</span></span>
        <span className={`text-xs font-bold rounded px-2 py-0.5 ${room.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : room.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{room.status}</span>
      </div>
      <div className="flex justify-center mb-8">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl px-8 py-4 rounded-full shadow-lg" onClick={handleCount}>
          Tap to Count Dhikr
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {room.participants.map(p => (
          <div key={p.id} className="flex flex-col items-center">
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full border" />
            ) : (
              <UserCircle className="w-10 h-10 text-gray-400" />
            )}
            <span className="text-xs mt-1 font-medium">{p.name}</span>
          </div>
        ))}
      </div>
      {room.type === 'YASEEN' && (
        <div className="grid grid-cols-11 gap-2 mb-8">
          {Array.from({ length: 83 }).map((_, i) => (
            <Button key={i} size="sm" className="bg-gray-100 text-gray-700 border border-gray-300" disabled={false}>
              {i + 1}
            </Button>
          ))}
        </div>
      )}
      {room.type === 'KHATM' && (
        <div className="grid grid-cols-6 gap-2 mb-8">
          {Array.from({ length: 30 }).map((_, i) => (
            <Button key={i} size="sm" className="bg-gray-100 text-gray-700 border border-gray-300" disabled={false}>
              Juz {i + 1}
            </Button>
          ))}
        </div>
      )}
      {milestone && (
        <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg mt-4 animate-pulse">
          <CheckCircle className="w-6 h-6" /> Collective milestone reached!
        </div>
      )}
    </div>
  );
}
