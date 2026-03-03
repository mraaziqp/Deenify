"use client";
import { useEffect, useState, useMemo } from 'react';

export type HalalFoodItem = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isHalal: boolean;
  source?: string;
  imageUrl?: string;
};

// Extended static data for comprehensive halal food guide
const EXTENDED_ITEMS: HalalFoodItem[] = [
  // Meats
  { id: 's1', name: 'Chicken (Halal Certified)', description: 'Chicken slaughtered according to Islamic rites from SANHA/MJC-certified suppliers.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80' },
  { id: 's2', name: 'Beef (Halal Certified)', description: 'Beef from certified halal butchers and abattoirs following Islamic slaughter (Zabiha).', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1556740772-1a741367b93e?w=400&q=80' },
  { id: 's3', name: 'Lamb / Mutton', description: 'Halal when slaughtered by a Muslim reciting Bismillah and following Islamic guidelines.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
  { id: 's4', name: 'Pork / Pig Products', description: 'Pork is explicitly forbidden in Islam. Includes lard, gelatin from pigs, and all pork derivatives.', category: 'Meat', isHalal: false, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb011b1a5b1?w=400&q=80' },
  { id: 's5', name: 'Turkey', description: 'Halal when properly slaughtered according to Islamic rites.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's6', name: 'Duck', description: 'Halal when properly slaughtered. Popular in some Muslim communities.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's7', name: 'Rabbit', description: 'Considered halal by majority of scholars when slaughtered according to Islamic rites.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's8', name: 'Game Meat (Venison, Kudu, Springbok)', description: 'Wild game is halal if a Muslim performs proper slaughter or hunting mentioning Allah\'s name.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's9', name: 'Non-Zabiha Meat', description: 'Meat not slaughtered according to Islamic guidelines — differs by scholar opinion for Ahlul Kitab slaughter.', category: 'Meat', isHalal: false, source: 'https://islamqa.info/' },
  // Seafood
  { id: 's10', name: 'Fish (all species)', description: 'All fish are halal according to the majority of scholars. No special slaughter needed.', category: 'Seafood', isHalal: true, source: 'https://islamqa.info/', imageUrl: 'https://images.unsplash.com/photo-1502741126161-68b3b7ee7a90?w=400&q=80' },
  { id: 's11', name: 'Shrimp / Prawns', description: 'Halal according to Shafi\'i, Maliki, and Hanbali schools. Debated in Hanafi school.', category: 'Seafood', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's12', name: 'Lobster & Crab', description: 'Halal according to most scholars. Considered permissible as sea creatures.', category: 'Seafood', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's13', name: 'Frog', description: 'Not permissible. The Prophet ﷺ prohibited killing frogs.', category: 'Seafood', isHalal: false, source: 'https://islamqa.info/' },
  { id: 's14', name: 'Calamari / Squid', description: 'Permissible according to most scholars as a sea creature.', category: 'Seafood', isHalal: true, source: 'https://islamqa.info/' },
  // Beverages
  { id: 's15', name: 'Alcohol (all forms)', description: 'Strictly forbidden. Includes beer, wine, spirits, and any intoxicating drink.', category: 'Beverages', isHalal: false, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a7167e67?w=400&q=80' },
  { id: 's16', name: 'Coca-Cola', description: 'Generally halal. No alcohol. However, check local certification as formulations can vary.', category: 'Beverages', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
  { id: 's17', name: 'Fruit Juices', description: 'Natural fruit juices with no additives are halal. Check for alcohol-based flavouring.', category: 'Beverages', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's18', name: 'Coffee & Tea', description: 'Halal. Natural caffeine is not considered intoxicating in the Islamic legal sense.', category: 'Beverages', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's19', name: 'Kombucha (high alcohol content)', description: 'If fermented to >0.5% alcohol, considered haram by many scholars. Check certification.', category: 'Beverages', isHalal: false, source: 'https://islamqa.info/' },
  // Dairy
  { id: 's20', name: 'Milk (Cow, Goat, Sheep)', description: 'All animal milk from halal animals is naturally halal.', category: 'Dairy', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's21', name: 'Cheese', description: 'Halal if made with microbial/vegetarian rennet or halal animal rennet. Check label.', category: 'Dairy', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's22', name: 'Yoghurt', description: 'Generally halal. Avoid flavours with alcohol-based additives or gelatine.', category: 'Dairy', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's23', name: 'Gelatine (pork-derived)', description: 'Haram if derived from pig bones or skin. Look for halal-certified or plant-based alternatives.', category: 'Dairy', isHalal: false, source: 'https://sanha.org.za/' },
  // Bakery & Grains
  { id: 's24', name: 'Bread', description: 'Generally halal unless it contains non-halal additives like L-cysteine from pork.', category: 'Bakery', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1586444248879-bc604a2b0e27?w=400&q=80' },
  { id: 's25', name: 'Rice', description: 'All plain rice is halal. A staple in Muslim households worldwide.', category: 'Grains', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's26', name: 'Pasta', description: 'Halal unless egg-based with questionable sources. Most commercial pasta is fine.', category: 'Grains', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's27', name: 'Cake / Pastries with Rum Extract', description: 'Haram if it contains real alcohol from rum or vanilla extract with alcohol.', category: 'Bakery', isHalal: false, source: 'https://islamqa.info/' },
  // Fruits & Vegetables
  { id: 's28', name: 'All Fruits', description: 'All fruits are halal in their natural form.', category: 'Fruits & Veg', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's29', name: 'All Vegetables', description: 'All vegetables are halal in their natural form.', category: 'Fruits & Veg', isHalal: true, source: 'https://islamqa.info/' },
  { id: 's30', name: 'Dates', description: 'Highly recommended in Sunnah. Perfect for breaking the fast.', category: 'Fruits & Veg', isHalal: true, source: 'https://islamqa.info/' },
  // Additives & E-numbers
  { id: 's31', name: 'E120 (Carmine / Cochineal)', description: 'Derived from insects. Not halal. Found in red-coloured foods and cosmetics.', category: 'Additives', isHalal: false, source: 'https://sanha.org.za/' },
  { id: 's32', name: 'E441 (Gelatine)', description: 'Can be pork or beef derived. Halal only if from halal-slaughtered bovine.', category: 'Additives', isHalal: false, source: 'https://sanha.org.za/' },
  { id: 's33', name: 'E471 (Mono/Diglycerides)', description: 'Can be animal-derived. Halal if from vegetable or halal animal sources — check certification.', category: 'Additives', isHalal: false, source: 'https://sanha.org.za/' },
  { id: 's34', name: 'Vanilla Essence (alcohol-based)', description: 'Contains alcohol as solvent. Many scholars consider small traces permissible; others avoid it.', category: 'Additives', isHalal: false, source: 'https://islamqa.info/' },
  // Fast Food (South Africa)
  { id: 's35', name: 'Nando\'s (South Africa)', description: 'Most Nando\'s in SA are halal-certified (MJC/SANHA). Confirm with your local branch.', category: 'Restaurants', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's36', name: 'KFC South Africa', description: 'Many KFC outlets in Cape Town and major cities are halal-certified. Check local signage.', category: 'Restaurants', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's37', name: 'McDonald\'s South Africa', description: 'Not universally halal-certified in SA. Check specific outlets for halal certification.', category: 'Restaurants', isHalal: false, source: 'https://sanha.org.za/' },
  // Snacks
  { id: 's38', name: 'Mars / Snickers / Twix', description: 'Contains animal rennet in some countries. Check local halal certification (SANHA approved in SA).', category: 'Snacks', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's39', name: 'Haribo Gummy Bears', description: 'Standard Haribo contains pork gelatine. Look for Halal-certified Haribo variants.', category: 'Snacks', isHalal: false, source: 'https://sanha.org.za/' },
  { id: 's40', name: 'Most Crisps (Plain)', description: 'Plain potato/corn-based crisps are generally halal. Check flavouring for non-halal additives.', category: 'Snacks', isHalal: true, source: 'https://sanha.org.za/' },
];

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
    const extras = EXTENDED_ITEMS.filter((i) => !dbNames.has(i.name.toLowerCase()));
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
