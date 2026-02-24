import { Button } from '@/components/ui/button';

export default function CommunityWorshipTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Create Group</Button>
        <input type="text" placeholder="Join via Code" className="border rounded px-3 py-2 text-lg focus:ring-emerald-400" />
      </div>
      <h2 className="text-xl font-semibold text-emerald-600 mb-4">My Groups</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
        {/* Example group cards */}
        {[1,2,3].map(i => (
          <div key={i} className="min-w-[220px] bg-emerald-50 rounded-lg shadow p-4 flex flex-col items-center">
            <span className="font-bold text-lg text-emerald-700">Group {i}</span>
            <span className="text-xs text-gray-500 mt-1">12 Members</span>
            <Button className="mt-3 bg-emerald-600 text-white">View</Button>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold text-emerald-600 mb-4">Public Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 flex flex-col items-center border border-emerald-100">
            <span className="font-bold text-lg text-emerald-700">Public Group {i}</span>
            <span className="text-xs text-gray-500 mt-1">24 Members</span>
            <Button className="mt-3 bg-emerald-600 text-white">Join</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
