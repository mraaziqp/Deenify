import type { LucideIcon } from "lucide-react";

export interface NavLink {
  href?: string;
  label?: string;
  icon?: LucideIcon;
  type?: 'link' | 'button' | 'divider' | 'title';
}

export interface UserProfile {
  level: 'revert_l1' | 'practicing';
  madhab?: 'Hanafi' | 'Maliki' | 'Shafi`i' | 'Hanbali';
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  profile: UserProfile;
  stats: Record<string, any>; // For future stats tracking
  progress: {
    completedMilestones: string[];
  };
}

export interface Juz {
  status: 'open' | 'claimed' | 'completed';
  uid?: string;
  claimedAt?: number; // Firestore timestamp
}

export interface Khatm {
  id: string;
  name: string;
  juz_map: {
    [juzNumber: number]: Juz;
  };
}

export interface StockScreening {
  ticker: string;
  verdict: 'HALAL' | 'DOUBTFUL' | 'HARAM';
  businessActivityCompliant: boolean;
  debtRatioCompliant: boolean;
  impureIncomeCompliant: boolean;
  summary: string;
}

// 'Ilm (Knowledge) Engine Types
export interface KnowledgeNode {
  id: string; // e.g., "bukhari_1", "sabr_concept"
  type: 'hadith' | 'concept' | 'ruling' | 'biography';
  source_book?: string; // "Sahih al-Bukhari"
  hadith_number?: number;
  content: {
    ar: string;
    en: string;
  };
  narrator?: string;
  metadata: {
    chapter_id?: number;
    verified: boolean;
    tags?: string[];
  }
}


export interface HadithDocument {
  collection_id: "bukhari" | "muslim";
  hadith_number: number;
  text_ar: string;
  text_en: string;
  chapter_title: string;
  grade: "Sahih" | "Hasan" | "Da'if";
  tags: string[]; // ["money", "ethics", "trade"]
}
