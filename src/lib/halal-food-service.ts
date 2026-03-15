/**
 * Halal Food Service
 *
 * This module centralises halal food data access. When you obtain API access
 * from an official certification body (SANHA, MJC, etc.), change the value of
 * HALAL_DATA_SOURCE and implement the corresponding fetch branch below.
 *
 *  → 'static'   — use the built-in curated list (current default)
 *  → 'sanha'    — fetch from SANHA's public API (plug in endpoint below)
 *  → 'mjc'      — fetch from MJC's public API   (plug in endpoint below)
 */

// ─── Configuration ──────────────────────────────────────────────────────────

export type HalalDataSource = 'static' | 'sanha' | 'mjc';

/** Change this once you have API credentials from the certification body. */
export const HALAL_DATA_SOURCE: HalalDataSource = 'static';

// ─── Types ───────────────────────────────────────────────────────────────────

export type HalalFoodItem = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isHalal: boolean;
  source?: string;
  imageUrl?: string;
};

// ─── Static Curated Data ─────────────────────────────────────────────────────

export const HALAL_STATIC_ITEMS: HalalFoodItem[] = [
  // Meats
  { id: 's1', name: 'Chicken (Halal Certified)', description: 'Chicken slaughtered according to Islamic rites from SANHA/MJC-certified suppliers.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80' },
  { id: 's2', name: 'Beef (Halal Certified)', description: 'Beef from certified halal butchers and abattoirs following Islamic slaughter (Zabiha).', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1556740772-1a741367b93e?w=400&q=80' },
  { id: 's3', name: 'Lamb / Mutton', description: 'Halal when slaughtered by a Muslim reciting Bismillah and following Islamic guidelines.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
  { id: 's4', name: 'Pork / Pig Products', description: 'Pork is explicitly forbidden in Islam. Includes lard, gelatin from pigs, and all pork derivatives.', category: 'Meat', isHalal: false, source: 'https://sanha.org.za/', imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb011b1a5b1?w=400&q=80' },
  { id: 's5', name: 'Turkey', description: 'Halal when properly slaughtered according to Islamic rites.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's6', name: 'Duck', description: 'Halal when properly slaughtered. Popular in some Muslim communities.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's7', name: 'Rabbit', description: 'Considered halal by majority of scholars when slaughtered according to Islamic rites.', category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's8', name: 'Game Meat (Venison, Kudu, Springbok)', description: "Wild game is halal if a Muslim performs proper slaughter or hunting mentioning Allah's name.", category: 'Meat', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's9', name: 'Non-Zabiha Meat', description: 'Meat not slaughtered according to Islamic guidelines — differs by scholar opinion for Ahlul Kitab slaughter.', category: 'Meat', isHalal: false, source: 'https://islamqa.info/' },
  // Seafood
  { id: 's10', name: 'Fish (all species)', description: 'All fish are halal according to the majority of scholars. No special slaughter needed.', category: 'Seafood', isHalal: true, source: 'https://islamqa.info/', imageUrl: 'https://images.unsplash.com/photo-1502741126161-68b3b7ee7a90?w=400&q=80' },
  { id: 's11', name: 'Shrimp / Prawns', description: "Halal according to Shafi'i, Maliki, and Hanbali schools. Debated in Hanafi school.", category: 'Seafood', isHalal: true, source: 'https://islamqa.info/' },
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
  { id: 's35', name: "Nando's (South Africa)", description: "Most Nando's in SA are halal-certified (MJC/SANHA). Confirm with your local branch.", category: 'Restaurants', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's36', name: 'KFC South Africa', description: 'Many KFC outlets in Cape Town and major cities are halal-certified. Check local signage.', category: 'Restaurants', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's37', name: "McDonald's South Africa", description: 'Not universally halal-certified in SA. Check specific outlets for halal certification.', category: 'Restaurants', isHalal: false, source: 'https://sanha.org.za/' },
  // Snacks
  { id: 's38', name: 'Mars / Snickers / Twix', description: 'Contains animal rennet in some countries. Check local halal certification (SANHA approved in SA).', category: 'Snacks', isHalal: true, source: 'https://sanha.org.za/' },
  { id: 's39', name: 'Haribo Gummy Bears', description: 'Standard Haribo contains pork gelatine. Look for Halal-certified Haribo variants.', category: 'Snacks', isHalal: false, source: 'https://sanha.org.za/' },
  { id: 's40', name: 'Most Crisps (Plain)', description: 'Plain potato/corn-based crisps are generally halal. Check flavouring for non-halal additives.', category: 'Snacks', isHalal: true, source: 'https://sanha.org.za/' },
];

// ─── Fetch Function ───────────────────────────────────────────────────────────

/**
 * Fetches halal food items from the configured source.
 *
 * To plug in the SANHA API:
 *   1. Set HALAL_DATA_SOURCE = 'sanha' above
 *   2. Replace the placeholder URL below with the real endpoint
 *   3. Map the API response shape onto HalalFoodItem fields
 *
 * To plug in the MJC API:
 *   1. Set HALAL_DATA_SOURCE = 'mjc'
 *   2. Same process as above
 */
export async function fetchHalalItems(
  search?: string,
  category?: string
): Promise<HalalFoodItem[]> {
  if (HALAL_DATA_SOURCE === 'sanha') {
    // TODO: Replace with actual SANHA API endpoint once access is granted
    // Example: const res = await fetch(`https://api.sanha.org.za/v1/products?q=${search}&category=${category}`, {
    //   headers: { Authorization: `Bearer ${process.env.SANHA_API_KEY}` }
    // });
    // const data = await res.json();
    // return data.products.map((p: any) => ({ id: p.id, name: p.productName, ... }));
    throw new Error('SANHA API not yet configured — waiting for partnership approval');
  }

  if (HALAL_DATA_SOURCE === 'mjc') {
    // TODO: Replace with actual MJC API endpoint once access is granted
    // Example: const res = await fetch(`https://api.mjc.org.za/halal/search?q=${search}`, {
    //   headers: { 'X-API-Key': process.env.MJC_API_KEY }
    // });
    // const data = await res.json();
    // return data.items.map((i: any) => ({ ... }));
    throw new Error('MJC API not yet configured — waiting for partnership approval');
  }

  // Default: return static curated data with optional client-side filtering
  let items = HALAL_STATIC_ITEMS;
  if (category && category !== 'All') {
    items = items.filter((i) => i.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q)
    );
  }
  return items;
}
