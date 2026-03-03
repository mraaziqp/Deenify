'use client';
import PDFReader from '@/components/pdf/PDFReader';
import Link from 'next/link';

// Place your Surah Yaaseen PDF at: public/books/surah-yaseen.pdf
// You can also place Surah Baqarah at: public/books/surah-baqarah.pdf
const LOCAL_PDF = '/books/surah-yaseen.pdf';
const FALLBACK_PDF = 'https://ia800904.us.archive.org/23/items/SurahYaseen_201303/Surah%20Yaseen.pdf';

export default function SurahYaseenReader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl mb-8" style={{background:'linear-gradient(135deg,#0a4a36 0%,#065f46 50%,#1e5f74 100%)',minHeight:'150px'}}>
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

        {/* Upload hint for admin */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <strong>📁 Local PDF Setup:</strong> Place your PDF at <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">public/books/surah-yaseen.pdf</code> to use your own file.
          The reader will load it automatically. If not found, an online version will be used as fallback.
        </div>

        {/* PDF Reader */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-teal-100">
          <PDFReader pdfUrl={LOCAL_PDF} bookId="surah-yaseen" />
        </div>
      </div>
    </div>
  );
}
