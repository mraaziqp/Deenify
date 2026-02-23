import React from "react";

export interface PDFReaderProps {
  url: string;
  title?: string;
}

export const PDFReader: React.FC<PDFReaderProps> = ({ url, title }) => {
  return (
    <div className="w-full h-[80vh] rounded-lg overflow-hidden border shadow-lg bg-white">
      {title && <div className="px-4 py-2 font-bold text-lg border-b bg-gray-50">{title}</div>}
      <iframe
        src={url}
        title={title || "PDF Reader"}
        className="w-full h-full border-none"
        allowFullScreen
      />
    </div>
  );
};
