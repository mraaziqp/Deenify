"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { mockBooks } from '@/lib/library-books';
import dynamic from 'next/dynamic';
import { useBookBookmark } from '@/hooks/use-book-bookmark';
import Link from 'next/link';
import { useRef } from 'react';

const PDFViewer = dynamic(() => import('@/components/pdf/PDFReader'), { ssr: false });

export default function ReadBookPage({ params }: { params: { bookId: string } }) {
  const { bookId } = params;
  const book = mockBooks.find(b => b.id === bookId);
  const { page, loading } = useBookBookmark(bookId);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeAccepted, setResumeAccepted] = useState(false);
  const pdfViewerRef = useRef<any>(null);

  // Show resume prompt if bookmark exists
  useEffect(() => {
    if (page && page > 1) setShowResumePrompt(true);
  }, [page]);

  if (!book) return <div className="p-8 text-center">Book not found.</div>;

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-[#F9F7F2] flex items-center justify-between px-4 py-2 border-b shadow-sm">
        <div className="font-serif text-lg font-semibold text-[#7C6F57]">{book.title}</div>
        {/* Bookmark icon, etc. */}
      </div>
      {/* Resume Prompt */}
      {/* Resume Modal */}
      {showResumePrompt && page && !resumeAccepted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full text-center">
            <div className="font-serif text-lg font-semibold text-[#7C6F57] mb-2">Resume Reading?</div>
            <div className="mb-4 text-[#7C6F57]">You have a bookmark at page <b>{page}</b>.</div>
            <div className="flex gap-3 justify-center">
              <button
                className="bg-[#7C6F57] text-white px-4 py-2 rounded font-semibold hover:bg-[#a89b7c] transition"
                onClick={() => { setResumeAccepted(true); setShowResumePrompt(false); }}
              >Resume</button>
              <button
                className="bg-gray-200 text-[#7C6F57] px-4 py-2 rounded font-semibold hover:bg-gray-300 transition"
                onClick={() => setShowResumePrompt(false)}
              >Start Over</button>
            </div>
          </div>
        </div>
      )}
      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        <PDFViewer pdfUrl={book.pdfStorageUrl} bookId={book.id} />
        {/* Floating Back Button (Mobile Only) */}
        <Link
          href="/library"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 sm:hidden bg-[#7C6F57] text-white px-6 py-3 rounded-full shadow-lg font-semibold text-base transition hover:bg-[#a89b7c]"
          style={{ minWidth: 160 }}
        >
          ← Back to Library
        </Link>
      </div>
    </div>
  );
}
