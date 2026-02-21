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

// Example mock data
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Al Mufeedah',
    author: 'Imam Al-Ghazali',
    coverImageUrl: '/books/al-mufeedah.jpg',
    pdfStorageUrl: '/books/al-mufeedah.pdf',
    pages: 250,
    category: 'Spirituality',
  },
  {
    id: '2',
    title: 'The Book of Knowledge',
    author: 'Imam Al-Ghazali',
    coverImageUrl: '/books/book-of-knowledge.jpg',
    pdfStorageUrl: '/books/book-of-knowledge.pdf',
    pages: 320,
    category: 'Knowledge',
  },
];
