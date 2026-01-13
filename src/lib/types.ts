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
