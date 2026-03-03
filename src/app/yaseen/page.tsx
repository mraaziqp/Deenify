'use client';
import PDFReader from '@/components/pdf/PDFReader';
import Link from 'next/link';
import { useState, useRef } from 'react';

const LOCAL_PDF = '/books/surah-yaseen.pdf';

const RECITERS = [
  { label: 'Mishary al-Afasy', slug: 'ar.alafasy' },
  { label: 'Abdur-Rahman as-Sudais', slug: 'ar.abdurrahmaansudais' },
  { label: 'Saad al-Ghamidi', slug: 'ar.saadalghamadi' },
  { label: 'Muhammad Ayyoub', slug: 'ar.muhammadayyoub' },
  { label: 'Hani ar-Rifai', slug: 'ar.hanirifai' },
];

function audioUrl(slug: string) {
  return `https://cdn.islamic.network/quran/audio-surah/128/${slug}/36.mp3`;
}

export default function SurahYaseenReader() {
  const [reciterIdx, setReciterIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  function changeReciter(idx: number) {
    setReciterIdx(idx);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl mb-6" style={{background:'linear-gradient(135deg,#0a4a36 0%,#065f46 50%,#1e5f74 100%)',minHeight:'150px'}}>
          <div className="absolute" style={{top:'-20px',right:'-20px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)',pointerEvents:'none'}} />
          <div className="absolute" style={{bottom:'-10px',left:'40px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(52,211,153,0.1) 0%,transparent 70%)',pointerEvents:'none'}} />
          <div className="absolute select-none" style={{top:'10px',right:'16px',color:'rgba(251,191,36,0.2)',fontSize:'3.5rem',lineHeight:1}}>✦</div>
          <div className="absolute select-none" style={{bottom:'6px',left:'14px',color:'rgba(251,191,36,0.12)',fontSize:'2rem',lineHeight:1}}>✦</div>
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none" style={{fontFamily:"'Scheherazade New',serif",fontSize:'5rem',color:'rgba(255,255,255,0.04)',fontWeight:700}}>يس والقرآن الحكيم</div>
          <div className="relative z-10 px-8 py-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{background:'rgba(251,191,36,0.2)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.3)'}}>
                ☪️ قلب القرآن
              </span>
            </div>
            <h1 className="text-white font-bold text-2xl md:text-3xl mb-1" style={{fontFamily:"'Scheherazade New',serif"}}>سورة يس</h1>
            <p className="text-emerald-200 text-sm font-medium mb-1">Surah Yaaseen — The Heart of the Quran (Chapter 36)</p>
            <p className="text-emerald-300 text-xs italic">&quot;Everything has a heart, and the heart of the Quran is Yaaseen.&quot; — Prophet Muhammad ﷺ</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/quran?surah=36"
                className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl transition-all"
                style={{background:'rgba(255,255,255,0.15)',color:'white',border:'1px solid rgba(255,255,255,0.2)'}}
              >
                📖 Read with Translation
              </Link>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="rounded-2xl p-5 mb-6" style={{background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)',border:'1px solid rgba(16,185,129,0.2)'}}>
          <h2 className="font-bold text-emerald-800 text-base mb-4 flex items-center gap-2">
            🎧 Listen to Surah Yaaseen
          </h2>
          {/* Reciter selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {RECITERS.map((r, i) => (
              <button
                key={r.slug}
                onClick={() => changeReciter(i)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: reciterIdx === i ? 'linear-gradient(135deg,#059669,#0d9488)' : 'white',
                  color: reciterIdx === i ? 'white' : '#065f46',
                  border: reciterIdx === i ? '1.5px solid #059669' : '1.5px solid rgba(5,150,105,0.3)',
                  boxShadow: reciterIdx === i ? '0 2px 8px rgba(5,150,105,0.25)' : 'none',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            key={RECITERS[reciterIdx].slug}
          >
            <source src={audioUrl(RECITERS[reciterIdx].slug)} type="audio/mpeg" />
          </audio>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-12 h-12 rounded-full text-white text-xl transition-all"
              style={{background:'linear-gradient(135deg,#059669,#0d9488)',boxShadow:'0 4px 12px rgba(5,150,105,0.35)'}}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <div>
              <p className="font-semibold text-emerald-800 text-sm">{RECITERS[reciterIdx].label}</p>
              <p className="text-xs text-emerald-600">{playing ? '🎵 Now playing…' : 'Tap ▶ to listen'}</p>
            </div>
            {/* Native controls as fallback */}
            <audio
              controls
              className="flex-1 rounded-xl h-9"
              src={audioUrl(RECITERS[reciterIdx].slug)}
              key={`ctrl-${RECITERS[reciterIdx].slug}`}
              style={{accentColor:'#059669'}}
            />
          </div>
        </div>

        {/* Upload hint for admin */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <strong>📁 PDF Setup:</strong> Place your PDF at <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">public/books/surah-yaseen.pdf</code> to use a local file. If not found, an online version will be used as fallback.
        </div>

        {/* PDF Reader */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-teal-100">
          <PDFReader pdfUrl={LOCAL_PDF} bookId="surah-yaseen" />
        </div>
      </div>
    </div>
  );
}
