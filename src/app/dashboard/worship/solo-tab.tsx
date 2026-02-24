// ...existing Solo tab components (personal counters, stats)
export default function SoloWorshipTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-emerald-600 mb-4">Personal Worship</h2>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="bg-emerald-50 rounded-lg p-4 shadow-sm">
          <span className="font-bold text-lg">Dhikr Counter</span>
          <div className="flex items-center gap-2 mt-2">
            <button className="bg-emerald-600 text-white rounded-full px-6 py-2 text-xl font-bold shadow hover:bg-emerald-700 transition">Tap</button>
            <span className="text-2xl font-bold text-emerald-700">123</span>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 shadow-sm">
          <span className="font-bold text-lg">Quran Khatm Progress</span>
          <div className="mt-2 text-emerald-700">12/30 Juz Completed</div>
        </div>
      </div>
    </div>
  );
}
