'use client';
import { useState, useMemo } from 'react';
import hisnulMuslimData from '@/data/hisnul_muslim.json';

const CHAPTERS = (
  hisnulMuslimData as {
    English: {
      TITLE: string;
      TEXT: {
        ARABIC_TEXT?: string;
        TRANSLITERATION?: string;
        TRANSLATED_TEXT?: string;
        REFERENCE?: string;
      }[];
    }[];
  }
).English;

// Categories for filtering
const CATEGORIES = [
  { label: 'All', filter: '' },
  { label: 'After Salah', filter: 'After Salah' },
  { label: 'Morning', filter: 'Morning' },
  { label: 'Evening', filter: 'Evening' },
  { label: 'Sleep & Wake', filter: 'Sleeping' },
  { label: 'Masjid', filter: 'Masjid' },
  { label: 'Forgiveness', filter: 'Forgiveness' },
  { label: 'Quran', filter: 'Quran' },
  { label: 'Protection', filter: 'Protection' },
];

export default function HisnulMuslimPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CHAPTERS.filter((ch) => {
      const matchesSearch =
        !search ||
        ch.TITLE.toLowerCase().includes(search.toLowerCase()) ||
        ch.TEXT.some(
          (t) =>
            t.TRANSLATED_TEXT?.toLowerCase().includes(search.toLowerCase()) ||
            t.TRANSLITERATION?.toLowerCase().includes(search.toLowerCase())
        );
      const matchesCategory =
        !activeCategory || ch.TITLE.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  return (
    <div className="min-h-screen" style={{background:'linear-gradient(180deg,#f0fdf8 0%,#ffffff 60%,#f8fffe 100%)'}}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* ── Hero Banner ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl mb-10" style={{background:'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#0f766e 100%)',minHeight:'11rem'}}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full" style={{background:'radial-gradient(circle,rgba(212,175,55,0.2) 0%,transparent 70%)',transform:'translate(20%,-30%)'}} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{background:'radial-gradient(circle,rgba(16,185,129,0.15) 0%,transparent 70%)',transform:'translate(-20%,30%)'}} />
          <div className="absolute top-3 right-8 select-none" style={{color:'rgba(251,191,36,0.22)',fontSize:'4.5rem',lineHeight:1}}>✦</div>
          <div className="absolute bottom-3 left-40 select-none" style={{color:'rgba(251,191,36,0.1)',fontSize:'3rem',lineHeight:1}}>✦</div>

          <div className="relative z-10 px-8 py-7 text-center">
            <p className="text-emerald-200 text-sm font-medium mb-2">☪️ Supplications from the Quran &amp; Sunnah</p>
            <h1 className="text-white font-bold text-4xl md:text-5xl mb-1" style={{letterSpacing:'-0.02em'}}>Hisnul Muslim</h1>
            <p style={{fontFamily:'Scheherazade New,Amiri,serif',fontSize:'2rem',color:'rgba(200,255,220,0.9)',lineHeight:1.4}}>حصن المسلم</p>
            <p className="text-emerald-100 text-sm mt-2" style={{opacity:0.8}}>Fortress of the Muslim — {CHAPTERS.length} chapters · {CHAPTERS.reduce((s,c)=>s+c.TEXT.length,0)} duas</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search duas, transliterations, translations..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-teal-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.filter ? '' : cat.filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.filter
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            Found {filtered.length} chapter{filtered.length !== 1 ? 's' : ''} matching &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Chapters */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🌙</div>
              <p>No duas found for your search.</p>
            </div>
          )}
          {filtered.map((chapter, chIdx) => {
            const originalIdx = CHAPTERS.indexOf(chapter);
            const isExpanded = expandedIdx === originalIdx;
            return (
              <div
                key={originalIdx}
                className="overflow-hidden transition-all"
                style={{
                  background:'white',
                  borderRadius:'1.25rem',
                  border: isExpanded ? '1.5px solid rgba(16,185,129,0.35)' : '1.5px solid rgba(0,0,0,0.07)',
                  boxShadow: isExpanded ? '0 4px 24px rgba(6,95,70,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Chapter Header */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left group"
                  onClick={() => setExpandedIdx(isExpanded ? null : originalIdx)}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{background: isExpanded ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#6ee7b7,#34d399)',boxShadow:'0 2px 8px rgba(5,150,105,0.25)'}}
                    >
                      {originalIdx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors">{chapter.TITLE}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{chapter.TEXT.length} dua{chapter.TEXT.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-emerald-100 text-emerald-700 rotate-180' : 'bg-gray-100 text-gray-500'}`}
                    style={{fontSize:'0.8rem',flexShrink:0}}>
                    ▾
                  </div>
                </button>

                {/* Chapter Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 space-y-5 pt-2" style={{borderTop:'1px solid rgba(16,185,129,0.12)'}}>
                    {chapter.TEXT.map((dua, duaIdx) => {
                      const copyKey = `${originalIdx}-${duaIdx}`;
                      return (
                        <div
                          key={duaIdx}
                          className="relative rounded-2xl p-5"
                          style={{background:'linear-gradient(145deg,#f0fdf8,#f8fffb)',border:'1px solid rgba(16,185,129,0.15)'}}
                        >
                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy([dua.ARABIC_TEXT, dua.TRANSLITERATION, dua.TRANSLATED_TEXT, dua.REFERENCE].filter(Boolean).join('\n'), copyKey)}
                            className="absolute top-3 right-3 text-xs bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg transition-all hover:bg-emerald-50"
                          >
                            {copiedIdx === copyKey ? '✓ Copied' : '📋 Copy'}
                          </button>

                          {/* Arabic text */}
                          {dua.ARABIC_TEXT && (
                            <div
                              className="text-right mb-4 pr-14"
                              dir="rtl" lang="ar"
                              style={{fontFamily:"'Scheherazade New','Amiri',serif",fontSize:'1.8rem',lineHeight:2.2,color:'#1a2e23',fontWeight:500}}
                            >
                              {dua.ARABIC_TEXT}
                            </div>
                          )}

                          {dua.ARABIC_TEXT && (dua.TRANSLITERATION || dua.TRANSLATED_TEXT) && (
                            <div style={{borderTop:'1px solid rgba(16,185,129,0.2)',marginBottom:'0.75rem'}} />
                          )}

                          {/* Transliteration */}
                          {dua.TRANSLITERATION && (
                            <p className="text-sm italic mb-2 leading-relaxed" style={{color:'#0d6e50'}}>{dua.TRANSLITERATION}</p>
                          )}

                          {/* Translation */}
                          {dua.TRANSLATED_TEXT && (
                            <p className="text-sm mb-2 leading-relaxed" style={{color:'#374151'}}>{dua.TRANSLATED_TEXT}</p>
                          )}

                          {/* Reference */}
                          {dua.REFERENCE && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{background:'rgba(16,185,129,0.1)',color:'#065f46'}}>
                              📚 {dua.REFERENCE}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
