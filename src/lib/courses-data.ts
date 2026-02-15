/**
 * Text-based Islamic Courseware for Deenify
 * Beginner-friendly reading tracks
 */

export interface CourseModule {
  id: string;
  title: string;
  content: string[];
  keyPoints: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  modules: CourseModule[];
}

export const courses: Course[] = [
  {
    id: 'muslim-essentials',
    title: 'The Muslim Essentials',
    description: 'Foundation course covering the core beliefs and practices of Islam',
    level: 'beginner',
    estimatedMinutes: 45,
    modules: [
      {
        id: 'the-creator',
        title: 'Module 1: The Creator (Allah)',
        content: [
          'At the heart of Islam lies the concept of Tawheed - the absolute oneness of Allah. This fundamental principle distinguishes Islam from all other belief systems. Tawheed means recognizing that Allah alone is the Creator, the Sustainer, and the only One worthy of worship.',
          'Allah has no partners, no equals, and no rivals. He was not born, nor does He give birth. He is eternal, without beginning or end. The Quran beautifully captures this in Surah Al-Ikhlas: "Say, He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent."',
          'Understanding Tawheed transforms how we see the world. Every blessing comes from Allah - the air we breathe, the food we eat, the ability to think and feel. When we truly internalize this, we develop tawakkul (trust in Allah), knowing that He is in control of all affairs and His wisdom surpasses our understanding.',
        ],
        keyPoints: [
          'Tawheed means the absolute oneness of Allah',
          'Allah has no partners, parents, or children',
          'Recognizing Allah as Creator changes our entire worldview',
          'Trust in Allah (tawakkul) comes from understanding His oneness',
        ],
      },
      {
        id: 'the-messenger',
        title: 'Module 2: The Messenger (Muhammad ﷺ)',
        content: [
          'Prophet Muhammad (peace be upon him) was born in Makkah around 570 CE, into the noble tribe of Quraysh. He grew up as an orphan, having lost his father before birth and his mother at age six. Despite these hardships, he was known throughout Makkah as "Al-Amin" (The Trustworthy) and "As-Sadiq" (The Truthful).',
          'At the age of 40, while meditating in the Cave of Hira, Angel Jibreel (Gabriel) appeared to him with the first revelation from Allah: "Read in the name of your Lord who created." This marked the beginning of his prophethood. For 23 years, he received revelations that would become the Quran, guiding humanity toward truth and justice.',
          'The Prophet\'s life exemplifies perfect character. He was merciful to all creatures, just in his dealings, patient in adversity, and humble despite his status. He taught us that faith is not just belief, but must be reflected in our actions and treatment of others. As the Quran states: "Indeed, in the Messenger of Allah you have an excellent example."',
        ],
        keyPoints: [
          'Prophet Muhammad ﷺ was known for his trustworthiness before prophethood',
          'He received the first revelation at age 40 in Cave Hira',
          'His character exemplifies mercy, justice, and humility',
          'We are commanded to follow his example (Sunnah)',
        ],
      },
      {
        id: 'the-purpose',
        title: 'Module 3: The Purpose (Worship)',
        content: [
          'Allah declares in the Quran: "I did not create the jinn and mankind except to worship Me." This verse reveals the profound purpose of our existence. But what does worship (ibadah) truly mean? It encompasses far more than just ritual prayers - it is a complete way of life.',
          'Ibadah means submitting to Allah in all aspects of life. When you work honestly to earn a living, that\'s ibadah. When you treat your parents with kindness, that\'s ibadah. When you smile at your brother or sister, that\'s ibadah. Every action performed with the intention of pleasing Allah becomes an act of worship.',
          'The Five Pillars of Islam provide the framework for this worship: Shahada (declaration of faith), Salah (prayer), Zakat (charity), Sawm (fasting), and Hajj (pilgrimage). These pillars structure our lives around remembrance of Allah. Together, they purify our hearts, discipline our souls, and connect us to the global Muslim community (Ummah).',
        ],
        keyPoints: [
          'Our purpose is to worship Allah in all aspects of life',
          'Ibadah includes both ritual worship and daily good deeds',
          'The Five Pillars structure our worship: Shahada, Salah, Zakat, Sawm, Hajj',
          'Every action with intention to please Allah is worship',
        ],
      },
    ],
  },
  {
    id: 'salah-mastery',
    title: 'Mastering Your Salah',
    description: 'Learn the proper way to perform the five daily prayers with understanding',
    level: 'beginner',
    estimatedMinutes: 60,
    modules: [
      {
        id: 'importance-of-salah',
        title: 'The Importance of Salah',
        content: [
          'Salah is the second pillar of Islam and the most important act of worship after the Shahada. It is the direct connection between the believer and Allah, performed five times daily. The Prophet ﷺ said: "The first thing a person will be accountable for on the Day of Judgment is their Salah."',
          'Unlike other pillars, Salah was prescribed directly by Allah to the Prophet during the miraculous Night Journey (Isra and Mi\'raj). Originally fifty prayers, Allah\'s mercy reduced it to five, while maintaining the reward of fifty. This shows Allah\'s infinite mercy and the special status of Salah.',
          'Regular Salah transforms the believer. It instills discipline, provides peace of mind, and serves as a constant reminder of Allah throughout the day. The Quran states: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater." (29:45)',
        ],
        keyPoints: [
          'Salah is the pillar that distinguishes a Muslim',
          'It was prescribed during the Night Journey (Mi\'raj)',
          'Five daily prayers with reward of fifty',
          'Salah transforms character and prevents evil',
        ],
      },
      {
        id: 'preparing-for-salah',
        title: 'Preparation and Wudu',
        content: [
          'Before standing for Salah, we must purify ourselves physically and spiritually. This begins with Wudu (ablution) - a ritual washing that symbolizes purity. The Prophet ﷺ said: "Wudu is half of faith."',
          'To perform Wudu: Begin with intention (niyyah) and say Bismillah. Wash hands three times. Rinse mouth and nose three times each. Wash face three times. Wash arms to elbows three times (right then left). Wipe head once. Wipe ears. Finally, wash feet to ankles three times. End with the dua: "Ashhadu an la ilaha illallah..."',
          'Cleanliness extends beyond Wudu. Our prayer space should be clean, our clothes modest and pure, and we should face the Qibla (direction of the Kaaba in Makkah). This physical preparation helps focus our minds and hearts on the worship ahead.',
        ],
        keyPoints: [
          'Wudu (ablution) is required before Salah',
          'Wudu has specific steps and sequence',
          'Physical cleanliness aids spiritual focus',
          'Face the Qibla (toward Makkah)',
        ],
      },
    ],
  },
  {
    id: 'ramadan-guide',
    title: 'The Sacred Month: Ramadan Guide',
    description: 'Comprehensive guide to fasting and maximizing blessings in Ramadan',
    level: 'beginner',
    estimatedMinutes: 50,
    modules: [
      {
        id: 'understanding-fasting',
        title: 'Understanding Fasting (Sawm)',
        content: [
          'Fasting during Ramadan is the fourth pillar of Islam. It means abstaining from food, drink, and intimate relations from dawn (Fajr) until sunset (Maghrib). But Ramadan fasting is not mere hunger - it\'s a holistic spiritual experience designed to train the soul.',
          'The Prophet ﷺ taught: "Whoever fasts Ramadan with faith and seeking reward from Allah, their past sins will be forgiven." This month is our annual spiritual reset, a chance to break bad habits, strengthen good ones, and reconnect with our Creator.',
          'Fasting teaches self-discipline, empathy for the poor, and gratitude for Allah\'s blessings. When we experience hunger, we remember those who face it daily. This cultivates compassion and motivates us to help others. The Quran was revealed in Ramadan, making it a month of guidance and mercy.',
        ],
        keyPoints: [
          'Fasting is abstinence from food, drink, and intimacy during daylight',
          'It\'s a spiritual training for the soul, not just physical hunger',
          'Ramadan offers forgiveness and multiplication of good deeds',
          'Develops self-discipline, empathy, and gratitude',
        ],
      },
    ],
  },
];

// Helper function to get course by ID
export function getCourseById(id: string): Course | undefined {
  return courses.find(course => course.id === id);
}

// Helper function to get all beginner courses
export function getBeginnerCourses(): Course[] {
  return courses.filter(course => course.level === 'beginner');
}
