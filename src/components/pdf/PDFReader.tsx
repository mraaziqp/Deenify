// PDFReader.tsx
'use client';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useEffect, useRef, useState } from 'react';
import { useBookBookmark } from '@/hooks/use-book-bookmark';


interface PDFReaderProps {
  pdfUrl: string;
  bookId: string;
}

export default function PDFReader({ pdfUrl, bookId }: PDFReaderProps) {

  const { page, saveBookmark } = useBookBookmark(bookId);
  const [currentPage, setCurrentPage] = useState<number>(page || 1);
  const [numPages, setNumPages] = useState<number>(0);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (page) setCurrentPage(page);
  }, [page]);

  const handlePageChange = (e: any) => {
    setCurrentPage(e.currentPage + 1);
    saveBookmark(e.currentPage + 1);
  };

  // PDF.js event for total pages
  const handleDocumentLoad = (e: any) => {
    setNumPages(e.doc.numPages);
  };

  // Progress bar calculation
  const progress = numPages > 0 ? Math.round((currentPage / numPages) * 100) : 0;

  return (
    <div className="w-full h-[80vh] max-w-4xl mx-auto bg-[#F9F7F2] rounded shadow flex flex-col relative">
      {/* Progress Bar */}
      {numPages > 0 && (
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ece7db] rounded-t-xl overflow-hidden z-20">
          <div
            className="h-full bg-[#7C6F57] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {/* Page Indicator */}
      {numPages > 0 && (
        <div className="absolute top-3 right-4 z-30 bg-[#f9f7f2cc] px-3 py-1 rounded-full text-xs font-semibold text-[#7C6F57] shadow">
          Page {currentPage} of {numPages}
        </div>
      )}
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          defaultScale={SpecialZoomLevel.PageFit}
          initialPage={currentPage - 1}
          onPageChange={handlePageChange}
          onDocumentLoad={handleDocumentLoad}
          plugins={[defaultLayoutPlugin()]}
          ref={viewerRef}
        />
      </Worker>
    </div>
  );
}
