"use client";
import { useEffect, useState, useMemo } from 'react';
import { type HalalFoodItem, HALAL_STATIC_ITEMS } from '@/lib/halal-food-service';

const CATEGORIES = ['All', 'Meat', 'Seafood', 'Beverages', 'Dairy', 'Bakery', 'Grains', 'Fruits & Veg', 'Additives', 'Restaurants', 'Snacks'];

export default function HalalFoodList() {
  const [dbItems, setDbItems] = useState<HalalFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'halal' | 'haram'>('all');

  useEffect(() => {
    fetch('/api/halal-food')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDbItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Merge DB items with extended static list (DB items take precedence by name)
  const allItems = useMemo(() => {
    const dbNames = new Set(dbItems.map((i) => i.name.toLowerCase()));
    const extras = HALAL_STATIC_ITEMS.filter((i) => !dbNames.has(i.name.toLowerCase()));
    return [...dbItems, ...extras];
  }, [dbItems]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'halal' && item.isHalal) ||
        (activeFilter === 'haram' && !item.isHalal);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [allItems, search, activeCategory, activeFilter]);

  const halalCount = allItems.filter((i) => i.isHalal).length;
  const haramCount = allItems.filter((i) => !i.isHalal).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl mb-10" style={{background:'linear-gradient(135deg,#14532d 0%,#166534 45%,#065f46 100%)',minHeight:'150px'}}>
          <div className="absolute" style={{top:'-20px',right:'-20px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)',pointerEvents:'none'}} />
          <div className="absolute" style={{bottom:'-10px',left:'40px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(134,239,172,0.12) 0%,transparent 70%)',pointerEvents:'none'}} />
          <div className="absolute select-none" style={{top:'10px',right:'16px',color:'rgba(251,191,36,0.2)',fontSize:'3.5rem',lineHeight:1}}>✦</div>
          <div className="absolute select-none" style={{bottom:'6px',left:'14px',color:'rgba(251,191,36,0.12)',fontSize:'2rem',lineHeight:1}}>✦</div>
          <div className="relative z-10 px-8 py-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{background:'rgba(251,191,36,0.2)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.3)'}}>
                ✅ الحلال والحرام
              </span>
            </div>
            <h1 className="text-white font-bold text-2xl md:text-3xl mb-1">Halal Food Guide</h1>
            <p className="text-green-200 text-sm mb-3">Based on the Quran, Sunnah &amp; South African halal authorities (SANHA / MJC)</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full font-medium" style={{background:'rgba(134,239,172,0.2)',color:'#86efac',border:'1px solid rgba(134,239,172,0.2)'}}>
                ✅ {halalCount} Halal Items
              </span>
              <span className="px-3 py-1 rounded-full font-medium" style={{background:'rgba(252,165,165,0.2)',color:'#fca5a5',border:'1px solid rgba(252,165,165,0.2)'}}>
                ❌ {haramCount} Not Halal
              </span>
              <span className="px-3 py-1 rounded-full font-medium" style={{background:'rgba(147,197,253,0.2)',color:'#93c5fd',border:'1px solid rgba(147,197,253,0.2)'}}>
                🏅 SANHA / MJC Referenced
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods, ingredients, additives..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-green-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {([['all', 'All Items', '🍽️'], ['halal', 'Halal Only', '✅'], ['haram', 'Not Halal', '❌']] as const).map(([val, label, icon]) => (
            <button
              key={val}
              onClick={() => setActiveFilter(val)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === val
                  ? val === 'halal' ? 'bg-green-600 text-white shadow' : val === 'haram' ? 'bg-red-500 text-white shadow' : 'bg-teal-600 text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {search && <span> for &ldquo;{search}&rdquo;</span>}
        </p>

        {/* Items Grid */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🤔</div>
            <p>No items found for your search.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
                item.isHalal ? 'border-green-100 hover:border-green-200' : 'border-red-100 hover:border-red-200'
              }`}
            >
              <div className="flex gap-0">
                {/* Color stripe */}
                <div className={`w-1.5 flex-shrink-0 ${item.isHalal ? 'bg-green-400' : 'bg-red-400'}`} />
                
                <div className="flex gap-3 p-4 flex-1 min-w-0">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                        {item.category && (
                          <span className="text-xs text-gray-400 mt-0.5 block">{item.category}</span>
                        )}
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          item.isHalal
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.isHalal ? '✅ Halal' : '❌ Haram'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{item.description}</p>
                    )}
                    {item.source && (
                      <a
                        href={item.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:underline mt-1.5 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📖 Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ Important Note</p>
          <p>
            This guide is for general reference only. Always verify with your local halal authority (SANHA, MJC, or
            NIHT in South Africa). Ingredients and formulations can change. When in doubt, abstain.
          </p>
        </div>
      </div>
    </div>
  );
}
