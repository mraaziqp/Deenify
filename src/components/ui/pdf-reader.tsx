import React from "react";

export interface PDFReaderProps {
  url: string;
  title?: string;
}

/**
 * For public/external URLs — wraps in Google Docs Viewer (works in all browsers).
 * For local/API URLs (e.g. /api/pdf-book?id=...) — Google Docs Viewer can't reach
 * localhost, so we fall back to a native <object> + download link.
 */
function isLocalUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.") ||
    url.startsWith("blob:")
  );
}

export const PDFReader: React.FC<PDFReaderProps> = ({ url, title }) => {
  const local = isLocalUrl(url);
  const viewerUrl = local
    ? url
    : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="w-full rounded-lg overflow-hidden border shadow-lg bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 gap-4">
        {title && <span className="font-bold text-lg truncate">{title}</span>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 text-sm text-teal-600 underline hover:text-teal-800 whitespace-nowrap"
        >
          Open / Download ↗
        </a>
      </div>

      {local ? (
        // Local API-served PDFs: render directly via <object>
        <object
          data={url}
          type="application/pdf"
          className="w-full border-none"
          style={{ height: "82vh" }}
        >
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <p className="text-sm">Your browser cannot display the PDF inline.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
            >
              Download / Open PDF
            </a>
          </div>
        </object>
      ) : (
        // External public PDFs: use Google Docs Viewer (works in all browsers)
        <iframe
          src={viewerUrl}
          title={title || "PDF Viewer"}
          className="w-full border-none"
          style={{ height: "82vh" }}
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
};

