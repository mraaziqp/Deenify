"use client";
import { useEffect, useState } from 'react';

export type HalalFoodItem = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isHalal: boolean;
  source?: string;
  imageUrl?: string;
};

export default function HalalFoodList() {
  const [items, setItems] = useState<HalalFoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/halal-food')
      .then(res => res.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10">Loading Halal Food Guide...</div>;

  if (!items.length) return <div className="text-center py-10">No halal food items found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Halal Food Guide</h2>
      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            )}
            <div>
              <div className="font-semibold text-lg">{item.name}</div>
              {item.category && <div className="text-xs text-gray-500 mb-1">{item.category}</div>}
              <div className="text-sm text-gray-700">{item.description}</div>
              {item.isHalal ? (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Halal</span>
              ) : (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Not Halal</span>
              )}
              {item.source && (
                <div className="text-xs mt-1 text-blue-600"><a href={item.source} target="_blank" rel="noopener noreferrer">Source</a></div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
