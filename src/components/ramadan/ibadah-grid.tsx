import { useState } from 'react';


const today = new Date();
const dateString = today.toISOString().slice(0, 10);
type IbadahGridState = {
  fard: boolean;
  taraweeh: boolean;
  taraweehRakat: 8 | 20;
  quran: boolean;
  juz: number;
};
const defaultGrid: IbadahGridState = {
  fard: false,
  taraweeh: false,
  taraweehRakat: 8,
  quran: false,
  juz: 1,
};


export default function IbadahGrid() {
  const [grid, setGrid] = useState<IbadahGridState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ibadahGrid-' + dateString);
        return saved ? JSON.parse(saved) : defaultGrid;
      } catch {
        return defaultGrid;
      }
    }
    return defaultGrid;
  });

  function updateGrid<K extends keyof IbadahGridState>(key: K, value: IbadahGridState[K]) {
    const newGrid = { ...grid, [key]: value };
    setGrid(newGrid);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ibadahGrid-' + dateString, JSON.stringify(newGrid));
      } catch {}
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2" aria-label="Ibadah Grid Daily Tracker">
      <h2 className="text-xl font-semibold mb-2" id="ibadah-grid-title">Ibadah Grid (Daily Tracker)</h2>
      <label className="flex items-center gap-2" aria-label="5 Fard Prayers">
        <input type="checkbox" checked={grid.fard} onChange={e => updateGrid('fard', e.target.checked)} aria-checked={grid.fard} />
        5 Fard Prayers
      </label>
      <label className="flex items-center gap-2" aria-label="Taraweeh">
        <input type="checkbox" checked={grid.taraweeh} onChange={e => updateGrid('taraweeh', e.target.checked)} aria-checked={grid.taraweeh} />
        Taraweeh
        <select value={grid.taraweehRakat} onChange={e => updateGrid('taraweehRakat', Number(e.target.value) as 8 | 20)} className="ml-2 border rounded px-1" aria-label="Taraweeh Rakats">
          <option value={8}>8 Rakats</option>
          <option value={20}>20 Rakats</option>
        </select>
      </label>
      <label className="flex items-center gap-2" aria-label="Quran Goal">
        <input type="checkbox" checked={grid.quran} onChange={e => updateGrid('quran', e.target.checked)} aria-checked={grid.quran} />
        Quran Goal: Read Juz
        <input type="number" min={1} max={30} value={grid.juz} onChange={e => updateGrid('juz', Number(e.target.value))} className="ml-2 w-16 border rounded px-1" aria-label="Juz Number" />
      </label>
    </div>
  );
}
