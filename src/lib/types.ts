import type { LucideIcon } from "lucide-react";

export interface NavLink {
  href?: string;
  label?: string;
  icon?: LucideIcon;
  type?: 'link' | 'button' | 'divider' | 'title';
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  madhab?: 'Hanafi' | 'Maliki' | 'Shafi`i' | 'Hanbali';
  fluencyLevel: 'new' | 'beginner' | 'intermediate' | 'advanced';
  progress: {
    completedMilestones: string[];
  };
}
