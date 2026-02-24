import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function GroupDashboard() {
  // Example group data
  const group = {
    name: 'Ramadan Khatm Jamaah',
    memberCount: 18,
    inviteCode: 'ABC123',
    campaigns: [
      { id: 'c1', title: 'Friday Salawat', type: 'DHIKR', targetCount: 100000, currentCount: 45000, status: 'ACTIVE' },
      { id: 'c2', title: 'Monthly Khatm', type: 'KHATM', targetCount: 30, currentCount: 12, status: 'ACTIVE' },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-emerald-700 mb-2">{group.name}</h1>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-lg text-gray-700">{group.memberCount} Members</span>
          <Button className="bg-emerald-600 text-white" onClick={() => navigator.clipboard.writeText(group.inviteCode)}>
            Invite Friends
          </Button>
        </div>
        <div className="text-xs text-gray-400">Invite Code: <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded">{group.inviteCode}</span></div>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-emerald-600">Active Campaigns</h2>
          <Button className="bg-emerald-600 text-white">Start New Campaign</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {group.campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6 border border-emerald-100">
              <span className="font-bold text-lg text-emerald-700">{c.title}</span>
              <div className="mt-2 text-xs text-gray-500">Type: {c.type}</div>
              <div className="mt-2">
                {c.type === 'DHIKR' ? (
                  <>
                    <div className="w-full bg-emerald-100 rounded h-4 mt-2">
                      <div className="bg-emerald-600 h-4 rounded" style={{ width: `${(c.currentCount/c.targetCount)*100}%` }} />
                    </div>
                    <div className="mt-1 text-sm text-emerald-700">{c.currentCount} / {c.targetCount}</div>
                  </>
                ) : (
                  <div className="mt-2 text-emerald-700">{c.currentCount} / {c.targetCount} Juz Completed</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
