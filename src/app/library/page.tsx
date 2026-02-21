import Link from 'next/link';
import { mockBooks } from '@/lib/library-books';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] py-10 px-4">
      <h1 className="text-3xl font-serif font-bold mb-8 text-center text-[#7C6F57]">Maktabah (Islamic Library)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {mockBooks.map((book, i) => (
          <div
            key={book.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow flex flex-col items-center p-4 border border-[#f3ede2] animate-fade-in"
            style={{ minHeight: 340, animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-48 object-contain rounded mb-4 bg-[#F9F7F2]"
            />
            <div className="flex-1 flex flex-col justify-between w-full">
              <h2 className="font-serif text-lg font-semibold text-[#7C6F57] mb-1 text-center">{book.title}</h2>
              <p className="text-xs text-gray-500 mb-2 text-center">by {book.author}</p>
              <Link
                href={`/library/read/${book.id}`}
                className="mt-2 w-full inline-block bg-[#e9e3d3] hover:bg-[#f3ede2] text-[#7C6F57] font-semibold py-2 rounded transition text-center shadow"
              >
                Read Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    // Add fade-in animation
    // In your global CSS (e.g., src/app/globals.css), add:
    // @keyframes fade-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    // .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1); }
    </div>
  );
}
