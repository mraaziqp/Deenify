import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DhikrBatchEngine({ campaignId }: { campaignId: string }) {
  const [localCount, setLocalCount] = useState(0);
  const [batch, setBatch] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // SWR polling for real-time sync
  const { data, mutate } = useSWR(`/api/campaign/${campaignId}/count`, fetcher, { refreshInterval: 3000 });

  // Batch update every 3s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (batch > 0) {
        fetch(`/api/campaign/${campaignId}/increment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ increment: batch }),
        }).then(() => {
          setBatch(0);
          mutate();
        });
      }
    }, 3000);
    return () => clearInterval(intervalRef.current!);
  }, [batch, campaignId, mutate]);

  function handleTap() {
    setLocalCount(c => c + 1);
    setBatch(b => b + 1);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button className="bg-emerald-600 text-white text-2xl px-8 py-4 rounded-full shadow-lg" onClick={handleTap}>
        Tap to Count Dhikr
      </Button>
      <div className="text-xl font-bold text-emerald-700">Your Session: {localCount}</div>
      <div className="text-lg text-gray-700">Total: {data?.currentCount ?? 0}</div>
    </div>
  );
}
