import SuhoorIftarWidget from './suhoor-iftar-widget';
import IbadahGrid from './ibadah-grid';
import GoodDeedOfTheDay from './good-deed-of-the-day';

export default function RamadanDashboard() {
  return (
    <div className="flex flex-col gap-8 p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Ramadan OS Dashboard</h1>
      <SuhoorIftarWidget />
      <GoodDeedOfTheDay />
      <IbadahGrid />
      <div>
        <h2 className="text-xl font-semibold mb-2">Local Diet Tips</h2>
        <div className="mb-2">
          <span className="font-semibold">Good:</span> Drink 500ml water. Eat dates and oats.<br />
          <span className="font-semibold">Bad:</span> Avoid too many bolla/samoosas/pies (heartburn risk).
        </div>
        {/* For more tips, see below */}
        <div className="mt-2">
          {require('./suhoor-manager-tips').default()}
        </div>
      </div>
    </div>
  );
}
