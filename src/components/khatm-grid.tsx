import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function KhatmGrid({ campaignId, userId }: { campaignId: string, userId: string }) {
  const { data, mutate } = useSWR(`/api/campaign/${campaignId}/juz`, fetcher, { refreshInterval: 3000 });
  const [claiming, setClaiming] = useState<number | null>(null);

  async function handleClaim(juzNumber: number) {
    setClaiming(juzNumber);
    const res = await fetch(`/api/campaign/${campaignId}/claim-juz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ juzNumber, userId }),
    });
    if (res.ok) {
      mutate();
    } else {
      const err = await res.json();
      alert(err.message || 'Another brother/sister just claimed this Juz!');
    }
    setClaiming(null);
  }

  return (
    <div className="grid grid-cols-6 gap-2 mt-6">
      {data?.juz?.map((j: any) => (
        <Button
          key={j.juzNumber}
          size="sm"
          className={`border font-bold ${
            j.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
            j.status === 'READING' ? 'bg-yellow-100 text-yellow-700' :
            j.status === 'COMPLETED' ? 'bg-yellow-300 text-yellow-900' : ''
          }`}
          disabled={j.status !== 'OPEN' || claiming === j.juzNumber}
          onClick={() => handleClaim(j.juzNumber)}
        >
          Juz {j.juzNumber}
          {j.status === 'READING' && j.claimedByName && (
            <span className="block text-xs mt-1">Claimed by {j.claimedByName}</span>
          )}
          {j.status === 'COMPLETED' && <span className="block text-xs mt-1">Completed</span>}
        </Button>
      ))}
    </div>
  );
}
