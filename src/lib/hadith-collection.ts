/**
 * Collection of authentic Hadiths for daily wisdom
 * Source: Sahih Bukhari, Sahih Muslim, and other authentic collections
 */

export interface Hadith {
  id: number;
  arabic?: string;
  english: string;
  narrator: string;
  source: string;
  reference: string;
  category: string;
}

export const hadithCollection: Hadith[] = [
  {
    id: 1,
    english: "The deeds most loved by Allah are those done regularly, even if they are small.",
    narrator: "Aisha (RA)",
    source: "Sahih Bukhari",
    reference: "Book 76, Hadith 469",
    category: "Consistency"
  },
  {
    id: 2,
    english: "The strong person is not the one who can overpower others, but the one who controls themselves when angry.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 73, Hadith 135",
    category: "Self-Control"
  },
  {
    id: 3,
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Anas ibn Malik (RA)",
    source: "Sahih Bukhari",
    reference: "Book 2, Hadith 12",
    category: "Brotherhood"
  },
  {
    id: 4,
    english: "A man is upon the religion of his close friend, so let one of you look at whom he befriends.",
    narrator: "Abu Huraira (RA)",
    source: "Sunan Abi Dawud",
    reference: "Book 42, Hadith 4833",
    category: "Friendship"
  },
  {
    id: 5,
    english: "The believer who mixes with people and bears their annoyance with patience will have a greater reward than the one who does not mix with people.",
    narrator: "Ibn Umar (RA)",
    source: "Sunan Ibn Majah",
    reference: "Book 37, Hadith 4032",
    category: "Patience"
  },
  {
    id: 6,
    english: "The best of people are those with the most excellent character.",
    narrator: "Abdullah ibn Amr (RA)",
    source: "Musnad Ahmad",
    reference: "Hadith 6566",
    category: "Character"
  },
  {
    id: 7,
    english: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 73, Hadith 47",
    category: "Speech"
  },
  {
    id: 8,
    english: "The most beloved of deeds to Allah are those that are most consistent, even if they are few.",
    narrator: "Aisha (RA)",
    source: "Sahih Muslim",
    reference: "Book 6, Hadith 315",
    category: "Worship"
  },
  {
    id: 9,
    english: "Richness is not having many possessions, but richness is being content with oneself.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 81, Hadith 15",
    category: "Contentment"
  },
  {
    id: 10,
    english: "Make things easy and do not make them difficult. Give glad tidings and do not repel people.",
    narrator: "Anas ibn Malik (RA)",
    source: "Sahih Bukhari",
    reference: "Book 3, Hadith 125",
    category: "Da'wah"
  },
  {
    id: 11,
    english: "The best charity is that given when one is healthy and content, fearing poverty but hoping for wealth.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 24, Hadith 14",
    category: "Charity"
  },
  {
    id: 12,
    english: "Whoever relieves a believer's distress, Allah will relieve his distress on the Day of Resurrection.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Muslim",
    reference: "Book 32, Hadith 6518",
    category: "Helping Others"
  },
  {
    id: 13,
    english: "A good word is charity.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 56, Hadith 128",
    category: "Kindness"
  },
  {
    id: 14,
    english: "The most perfect believers in faith are those with the best character, and the best of you are those who are best to their wives.",
    narrator: "Abu Huraira (RA)",
    source: "Sunan At-Tirmidhi",
    reference: "Book 12, Hadith 1162",
    category: "Family"
  },
  {
    id: 15,
    english: "Seeking knowledge is an obligation upon every Muslim.",
    narrator: "Anas ibn Malik (RA)",
    source: "Sunan Ibn Majah",
    reference: "Book 1, Hadith 224",
    category: "Knowledge"
  },
  {
    id: 16,
    english: "The creation are dependents of Allah, and the most beloved to Him are those most beneficial to His dependents.",
    narrator: "Abdullah ibn Abbas (RA)",
    source: "Al-Mu'jam al-Awsat",
    reference: "Hadith 6192",
    category: "Service"
  },
  {
    id: 17,
    english: "A person's feet will not move on the Day of Judgment until they are asked about their life and how they spent it, their knowledge and how they acted upon it, their wealth and how they earned and spent it, and their body and how they used it.",
    narrator: "Abdullah ibn Mas'ud (RA)",
    source: "Sunan At-Tirmidhi",
    reference: "Book 34, Hadith 2417",
    category: "Accountability"
  },
  {
    id: 18,
    english: "The world is a prison for the believer and a paradise for the disbeliever.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Muslim",
    reference: "Book 41, Hadith 7058",
    category: "Perspective"
  },
  {
    id: 19,
    english: "Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your work, and your life before your death.",
    narrator: "Abdullah ibn Abbas (RA)",
    source: "Al-Mustadrak",
    reference: "Hadith 7846",
    category: "Time"
  },
  {
    id: 20,
    english: "Actions are judged by intentions, so each person will be rewarded according to their intention.",
    narrator: "Umar ibn al-Khattab (RA)",
    source: "Sahih Bukhari",
    reference: "Book 1, Hadith 1",
    category: "Intention"
  },
  {
    id: 21,
    english: "Paradise lies at the feet of your mother.",
    narrator: "Muawiyah ibn Jahima (RA)",
    source: "Sunan An-Nasa'i",
    reference: "Book 25, Hadith 3104",
    category: "Parents"
  },
  {
    id: 22,
    english: "The one who is not merciful to others will not be treated mercifully by Allah.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 73, Hadith 42",
    category: "Mercy"
  },
  {
    id: 23,
    english: "Among the best of people are those with the best manners.",
    narrator: "Abdullah ibn Amr (RA)",
    source: "Musnad Ahmad",
    reference: "Hadith 6566",
    category: "Manners"
  },
  {
    id: 24,
    english: "The Muslim is the one from whose tongue and hand the Muslims are safe.",
    narrator: "Abdullah ibn Amr (RA)",
    source: "Sahih Bukhari",
    reference: "Book 2, Hadith 9",
    category: "Safety"
  },
  {
    id: 25,
    english: "Whoever does not thank people has not thanked Allah.",
    narrator: "Abu Huraira (RA)",
    source: "Sunan Abi Dawud",
    reference: "Book 42, Hadith 4811",
    category: "Gratitude"
  },
  {
    id: 26,
    english: "The hand that gives is better than the hand that receives.",
    narrator: "Abdullah ibn Umar (RA)",
    source: "Sahih Bukhari",
    reference: "Book 24, Hadith 50",
    category: "Generosity"
  },
  {
    id: 27,
    english: "Modesty is part of faith.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Muslim",
    reference: "Book 1, Hadith 57",
    category: "Modesty"
  },
  {
    id: 28,
    english: "Whoever guarantees me what is between his jaws and what is between his legs, I guarantee him Paradise.",
    narrator: "Sahl ibn Sa'd (RA)",
    source: "Sahih Bukhari",
    reference: "Book 76, Hadith 481",
    category: "Chastity"
  },
  {
    id: 29,
    english: "When Allah loves a servant, He calls Gabriel and says: 'I love so-and-so, so love him.' Then Gabriel loves him and calls out to the inhabitants of heaven, 'Allah loves so-and-so, so love him.' And the inhabitants of heaven love him, and then acceptance is placed on earth for him.",
    narrator: "Abu Huraira (RA)",
    source: "Sahih Bukhari",
    reference: "Book 78, Hadith 142",
    category: "Love of Allah"
  },
  {
    id: 30,
    english: "Be in this world as if you are a stranger or a traveler passing through.",
    narrator: "Abdullah ibn Umar (RA)",
    source: "Sahih Bukhari",
    reference: "Book 76, Hadith 425",
    category: "Detachment"
  },
];

/**
 * Get hadith of the day based on current date
 * Uses day of year to ensure same hadith is shown throughout the day
 */
export function getDailyHadith(): Hadith {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % hadithCollection.length;
  return hadithCollection[index];
}

/**
 * Get hadith by ID
 */
export function getHadithById(id: number): Hadith | undefined {
  return hadithCollection.find(h => h.id === id);
}

/**
 * Get random hadith (for variety features)
 */
export function getRandomHadith(): Hadith {
  const randomIndex = Math.floor(Math.random() * hadithCollection.length);
  return hadithCollection[randomIndex];
}
