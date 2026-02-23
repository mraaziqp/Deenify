// Shared types and constants for Learning Library
export const resourceTypes = [
  { value: 'pdf', label: 'PDF' },
  { value: 'book', label: 'Book' },
] as const;

export type ResourceType = (typeof resourceTypes)[number]['value'];

export type LearningResource = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  url: string;
  coverImageUrl?: string | null;
  author?: string | null;
  language?: string | null;
  pageCount?: number | null;
  tags?: string[];
  published: boolean;
  createdAt: string;
};

export type LearningQuestion = {
  id: string;
  userName?: string | null;
  question: string;
  aiAnswer?: string | null;
  approvedAnswer?: string | null;
  status: string;
  createdAt: string;
};
