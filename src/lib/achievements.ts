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
  // Dhikr Achievements (daily counts)
  {
    id: 'dhikr_first_33',
    title: 'First Steps',
    description: 'Complete 33 Dhikr in a single day (1 Tasbih)',
    icon: '🌙',
    category: 'dhikr',
    requirement: 33,
  },
  {
    id: 'dhikr_first_100',
    title: 'First Century',
    description: 'Complete 100 Dhikr in a single day',
    icon: '🌟',
    category: 'dhikr',
    requirement: 100,
  },
  {
    id: 'dhikr_300',
    title: 'Devoted Rememberer',
    description: 'Reach 300 Dhikr in one day',
    icon: '✨',
    category: 'dhikr',
    requirement: 300,
  },
  {
    id: 'dhikr_streak_3',
    title: 'Building Habits',
    description: 'Maintain a 3-day Dhikr streak',
    icon: '🔥',
    category: 'dhikr',
    requirement: 3,
  },
  {
    id: 'dhikr_streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day Dhikr streak',
    icon: '⚡',
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
  
  // Quran Achievements (realistic reading goals)
  {
    id: 'quran_pages_5',
    title: 'First Pages',
    description: 'Read 5 pages of the Quran',
    icon: '📗',
    category: 'quran',
    requirement: 5,
  },
  {
    id: 'quran_juz_1',
    title: 'First Juz',
    description: 'Complete reading your first Juz (20 pages)',
    icon: '📖',
    category: 'quran',
    requirement: 1,
  },
  {
    id: 'quran_juz_5',
    title: 'Consistent Reader',
    description: 'Complete 5 Juz (100 pages)',
    icon: '📚',
    category: 'quran',
    requirement: 5,
  },
  {
    id: 'quran_juz_15',
    title: 'Halfway There',
    description: 'Complete 15 Juz (half the Quran)',
    icon: '🌗',
    category: 'quran',
    requirement: 15,
  },
  {
    id: 'quran_khatm',
    title: 'Khatm Completer',
    description: 'Complete an entire Quran reading (30 Juz)',
    icon: '🌙',
    category: 'quran',
    requirement: 30,
  },
  
  // Khatm Circle Achievements (collaborative reading)
  {
    id: 'khatm_participate',
    title: 'Circle Participant',
    description: 'Claim your first Juz in a Khatm circle',
    icon: '🤝',
    category: 'khatm',
    requirement: 1,
  },
  {
    id: 'khatm_complete_3',
    title: 'Dedicated Reciter',
    description: 'Complete 3 Juz in Khatm circles',
    icon: '⭐',
    category: 'khatm',
    requirement: 3,
  },
  {
    id: 'khatm_complete_10',
    title: 'Circle Champion',
    description: 'Complete 10 Juz in Khatm circles',
    icon: '🏅',
    category: 'khatm',
    requirement: 10,
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
    id: 'course_three',
    title: 'Knowledge Seeker',
    description: 'Complete 3 courses',
    icon: '📚',
    category: 'courses',
    requirement: 3,
  },
  {
    id: 'course_five',
    title: 'Scholar in Training',
    description: 'Complete 5 courses',
    icon: '🏅',
    category: 'courses',
    requirement: 5,
  },
  
  // General Achievements (app usage)
  {
    id: 'general_3day_active',
    title: 'Getting Started',
    description: 'Use the app for 3 consecutive days',
    icon: '🌱',
    category: 'general',
    requirement: 3,
  },
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
      // Dhikr count achievements
      case 'dhikr_first_33':
      case 'dhikr_first_100':
      case 'dhikr_300':
        unlocked = progress.dhikrCount >= achievement.requirement;
        break;
      // Dhikr streak achievements
      case 'dhikr_streak_3':
      case 'dhikr_streak_7':
      case 'dhikr_streak_30':
        unlocked = progress.dhikrStreak >= achievement.requirement;
        break;
      // Quran reading achievements (pages and Juz)
      case 'quran_pages_5':
        unlocked = progress.quranPagesRead >= achievement.requirement;
        break;
      case 'quran_juz_1':
      case 'quran_juz_5':
      case 'quran_juz_15':
      case 'quran_khatm':
        unlocked = Math.floor(progress.quranPagesRead / 20) >= achievement.requirement;
        break;
      // Khatm circle achievements
      case 'khatm_participate':
      case 'khatm_complete_3':
      case 'khatm_complete_10':
        unlocked = progress.khatmJuzCompleted >= achievement.requirement;
        break;
      // Course achievements
      case 'course_first':
      case 'course_three':
      case 'course_five':
        unlocked = progress.coursesCompleted >= achievement.requirement;
        break;
      // General app usage achievements
      case 'general_3day_active':
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


// Removed loadProgress and saveProgress. All progress should come from the database via API.
