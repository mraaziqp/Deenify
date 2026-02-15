export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'dhikr' | 'quran' | 'courses' | 'khatm' | 'general';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  dhikrCount: number;
  dhikrStreak: number;
  quranPagesRead: number;
  coursesCompleted: number;
  khatmJuzCompleted: number;
  daysActive: number;
  lastActiveDate: string;
}

export const achievementsList: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Dhikr Achievements
  {
    id: 'dhikr_first_100',
    title: 'First Century',
    description: 'Complete 100 Dhikr in a single day',
    icon: '🌟',
    category: 'dhikr',
    requirement: 100,
  },
  {
    id: 'dhikr_500',
    title: 'Devoted Rememberer',
    description: 'Reach 500 Dhikr in one day',
    icon: '✨',
    category: 'dhikr',
    requirement: 500,
  },
  {
    id: 'dhikr_1000',
    title: 'Master of Remembrance',
    description: 'Complete 1000 Dhikr in one day',
    icon: '💫',
    category: 'dhikr',
    requirement: 1000,
  },
  {
    id: 'dhikr_streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day Dhikr streak',
    icon: '🔥',
    category: 'dhikr',
    requirement: 7,
  },
  {
    id: 'dhikr_streak_30',
    title: 'Month Master',
    description: 'Maintain a 30-day Dhikr streak',
    icon: '🏆',
    category: 'dhikr',
    requirement: 30,
  },
  
  // Quran Achievements
  {
    id: 'quran_juz_1',
    title: 'First Juz',
    description: 'Complete reading your first Juz',
    icon: '📖',
    category: 'quran',
    requirement: 1,
  },
  {
    id: 'quran_juz_5',
    title: 'Consistent Reader',
    description: 'Complete 5 Juz',
    icon: '📚',
    category: 'quran',
    requirement: 5,
  },
  {
    id: 'quran_khatm',
    title: 'Khatm Completer',
    description: 'Complete an entire Quran reading',
    icon: '🌙',
    category: 'quran',
    requirement: 30,
  },
  
  // Khatm Circle Achievements
  {
    id: 'khatm_participate',
    title: 'Circle Participant',
    description: 'Claim your first Juz in a Khatm circle',
    icon: '🤝',
    category: 'khatm',
    requirement: 1,
  },
  {
    id: 'khatm_complete_5',
    title: 'Dedicated Reciter',
    description: 'Complete 5 Juz in Khatm circles',
    icon: '⭐',
    category: 'khatm',
    requirement: 5,
  },
  
  // Course Achievements
  {
    id: 'course_first',
    title: 'Eager Learner',
    description: 'Complete your first course',
    icon: '🎓',
    category: 'courses',
    requirement: 1,
  },
  {
    id: 'course_all',
    title: 'Knowledge Seeker',
    description: 'Complete all available courses',
    icon: '🏅',
    category: 'courses',
    requirement: 3,
  },
  
  // General Achievements
  {
    id: 'general_week_active',
    title: 'Consistent User',
    description: 'Use the app for 7 consecutive days',
    icon: '📅',
    category: 'general',
    requirement: 7,
  },
  {
    id: 'general_month_active',
    title: 'Dedicated Muslim',
    description: 'Use the app for 30 consecutive days',
    icon: '🌟',
    category: 'general',
    requirement: 30,
  },
  {
    id: 'general_explorer',
    title: 'Feature Explorer',
    description: 'Try all major features of the app',
    icon: '🧭',
    category: 'general',
    requirement: 5,
  },
];

export function checkAchievements(progress: UserProgress): Achievement[] {
  const achievements: Achievement[] = achievementsList.map(achievement => {
    let unlocked = false;
    
    switch (achievement.id) {
      case 'dhikr_first_100':
      case 'dhikr_500':
      case 'dhikr_1000':
        unlocked = progress.dhikrCount >= achievement.requirement;
        break;
      case 'dhikr_streak_7':
      case 'dhikr_streak_30':
        unlocked = progress.dhikrStreak >= achievement.requirement;
        break;
      case 'quran_juz_1':
      case 'quran_juz_5':
      case 'quran_khatm':
        unlocked = Math.floor(progress.quranPagesRead / 20) >= achievement.requirement;
        break;
      case 'khatm_participate':
      case 'khatm_complete_5':
        unlocked = progress.khatmJuzCompleted >= achievement.requirement;
        break;
      case 'course_first':
      case 'course_all':
        unlocked = progress.coursesCompleted >= achievement.requirement;
        break;
      case 'general_week_active':
      case 'general_month_active':
        unlocked = progress.daysActive >= achievement.requirement;
        break;
      default:
        unlocked = false;
    }
    
    return {
      ...achievement,
      unlocked,
    };
  });
  
  return achievements;
}

export function getProgressPercentage(progress: UserProgress): number {
  const totalAchievements = achievementsList.length;
  const achievements = checkAchievements(progress);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  return Math.round((unlockedCount / totalAchievements) * 100);
}

export function getDefaultProgress(): UserProgress {
  return {
    dhikrCount: 0,
    dhikrStreak: 0,
    quranPagesRead: 0,
    coursesCompleted: 0,
    khatmJuzCompleted: 0,
    daysActive: 0,
    lastActiveDate: new Date().toDateString(),
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();
  
  const saved = localStorage.getItem('userProgress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultProgress();
    }
  }
  return getDefaultProgress();
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userProgress', JSON.stringify(progress));
}
