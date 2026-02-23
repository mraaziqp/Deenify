import { FC } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  pdfStorageUrl: string;
  pages: number;
  category: string;
}


