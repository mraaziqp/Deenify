'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Clock,
  RotateCcw,
  Lightbulb,
  Check,
  X,
  Star,
  Zap,
  Medal,
  ChevronRight,
  Delete,
  Space,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
type Sentence = { english: string; arabic: string; category: string };
type Difficulty = 'easy' | 'medium' | 'hard';
type GamePhase = 'menu' | 'playing' | 'result';
type RoundResult = { correct: boolean; points: number; expected: string; given: string };
type LeaderboardEntry = { name: string; score: number; date: string; correct: number };

// ─── Constants ────────────────────────────────────────────────────────────────
const QUESTIONS_PER_GAME = 10;
const LEADERBOARD_KEY = 'deenify-arabic-typing-lb-v1';

const DIFFICULTY_CONFIG: Record<Difficulty, { seconds: number; label: string; color: string; description: string }> = {
  easy: { seconds: 45, label: 'Easy', color: 'emerald', description: '45 sec per sentence — best for beginners' },
  medium: { seconds: 30, label: 'Medium', color: 'amber', description: '30 sec per sentence — intermediate challenge' },
  hard: { seconds: 20, label: 'Hard', color: 'red', description: '20 sec per sentence — speed race!' },
};

// ─── 320 Arabic Sentences ────────────────────────────────────────────────────
const ALL_SENTENCES: Sentence[] = [
  // ── Greetings & Common Islamic Phrases
  { english: 'Peace be upon you', arabic: 'السلام عليكم', category: 'Greetings' },
  { english: 'And upon you peace', arabic: 'وعليكم السلام', category: 'Greetings' },
  { english: 'In the name of Allah', arabic: 'بسم الله', category: 'Islamic Phrases' },
  { english: 'Praise be to Allah', arabic: 'الحمد لله', category: 'Islamic Phrases' },
  { english: 'Glory be to Allah', arabic: 'سبحان الله', category: 'Islamic Phrases' },
  { english: 'Allah is the Greatest', arabic: 'الله اكبر', category: 'Islamic Phrases' },
  { english: 'There is no god but Allah', arabic: 'لا اله الا الله', category: 'Islamic Phrases' },
  { english: 'Muhammad is the messenger of Allah', arabic: 'محمد رسول الله', category: 'Islamic Phrases' },
  { english: 'I seek forgiveness from Allah', arabic: 'استغفر الله', category: 'Islamic Phrases' },
  { english: 'May Allah bless you', arabic: 'بارك الله فيك', category: 'Greetings' },
  { english: 'Good morning', arabic: 'صباح الخير', category: 'Greetings' },
  { english: 'Good evening', arabic: 'مساء الخير', category: 'Greetings' },
  { english: 'Welcome', arabic: 'اهلا وسهلا', category: 'Greetings' },
  { english: 'Thank you', arabic: 'شكرا', category: 'Greetings' },
  { english: 'You are welcome', arabic: 'عفوا', category: 'Greetings' },
  { english: 'How are you', arabic: 'كيف حالك', category: 'Greetings' },
  { english: 'I am fine', arabic: 'انا بخير', category: 'Greetings' },
  { english: 'What is your name', arabic: 'ما اسمك', category: 'Greetings' },
  { english: 'Where are you from', arabic: 'من اين انت', category: 'Greetings' },
  { english: 'I love Arabic', arabic: 'احب اللغة العربية', category: 'Learning' },
  { english: 'Arabic is beautiful', arabic: 'اللغة العربية جميلة', category: 'Learning' },
  { english: 'The Quran is the word of Allah', arabic: 'القران كلام الله', category: 'Islamic Phrases' },
  { english: 'Islam is the religion of peace', arabic: 'الاسلام دين السلام', category: 'Islamic Phrases' },
  { english: 'The mosque is the house of Allah', arabic: 'المسجد بيت الله', category: 'Islamic Phrases' },
  { english: 'Prayer is the pillar of religion', arabic: 'الصلاة عماد الدين', category: 'Islamic Phrases' },
  { english: 'Knowledge is light', arabic: 'العلم نور', category: 'Wisdom' },
  { english: 'Patience is the key to relief', arabic: 'الصبر مفتاح الفرج', category: 'Wisdom' },
  { english: 'Time is gold', arabic: 'الوقت من ذهب', category: 'Wisdom' },
  { english: 'Knowledge is power', arabic: 'العلم قوة', category: 'Wisdom' },
  { english: 'Unity is strength', arabic: 'الاتحاد قوة', category: 'Wisdom' },

  // ── Al-Fatiha Phrases
  { english: 'Praise be to Allah Lord of all worlds', arabic: 'الحمد لله رب العالمين', category: 'Al-Fatiha' },
  { english: 'The Most Gracious the Most Merciful', arabic: 'الرحمن الرحيم', category: 'Al-Fatiha' },
  { english: 'Master of the Day of Judgment', arabic: 'مالك يوم الدين', category: 'Al-Fatiha' },
  { english: 'You alone we worship', arabic: 'اياك نعبد', category: 'Al-Fatiha' },
  { english: 'And You alone we ask for help', arabic: 'واياك نستعين', category: 'Al-Fatiha' },
  { english: 'Guide us to the straight path', arabic: 'اهدنا الصراط المستقيم', category: 'Al-Fatiha' },
  { english: 'The path of those You have blessed', arabic: 'صراط الذين انعمت عليهم', category: 'Al-Fatiha' },
  { english: 'Not of those who earned anger', arabic: 'غير المغضوب عليهم', category: 'Al-Fatiha' },
  { english: 'Nor of those who went astray', arabic: 'ولا الضالين', category: 'Al-Fatiha' },

  // ── Quranic Phrases
  { english: 'Read in the name of your Lord', arabic: 'اقرا باسم ربك', category: 'Quran' },
  { english: 'Say He is Allah One', arabic: 'قل هو الله احد', category: 'Quran' },
  { english: 'Allah the Eternal Refuge', arabic: 'الله الصمد', category: 'Quran' },
  { english: 'He neither begot nor was born', arabic: 'لم يلد ولم يولد', category: 'Quran' },
  { english: 'And establish prayer', arabic: 'واقيموا الصلاة', category: 'Quran' },
  { english: 'And seek help through patience and prayer', arabic: 'واستعينوا بالصبر والصلاة', category: 'Quran' },
  { english: 'Allah is with the patient', arabic: 'ان الله مع الصابرين', category: 'Quran' },
  { english: 'Remember Me and I will remember you', arabic: 'فاذكروني اذكركم', category: 'Quran' },
  { english: 'Unquestionably hearts find rest in the remembrance of Allah', arabic: 'الا بذكر الله تطمئن القلوب', category: 'Quran' },
  { english: 'Everyone shall taste death', arabic: 'كل نفس ذائقة الموت', category: 'Quran' },
  { english: 'Indeed with hardship comes ease', arabic: 'ان مع العسر يسرا', category: 'Quran' },
  { english: 'And do not despair of Allah mercy', arabic: 'ولا تيؤسوا من رحمة الله', category: 'Quran' },
  { english: 'Allah does not burden a soul beyond what it can bear', arabic: 'لا يكلف الله نفسا الا وسعها', category: 'Quran' },
  { english: 'And We have certainly honored the children of Adam', arabic: 'ولقد كرمنا بني ادم', category: 'Quran' },
  { english: 'Who taught by the pen', arabic: 'الذي علم بالقلم', category: 'Quran' },
  { english: 'Read and your Lord is the Most Generous', arabic: 'اقرا وربك الاكرم', category: 'Quran' },
  { english: 'He taught man that which he knew not', arabic: 'علم الانسان ما لم يعلم', category: 'Quran' },
  { english: 'Say if you love Allah then follow me', arabic: 'قل ان كنتم تحبون الله فاتبعوني', category: 'Quran' },
  { english: 'And consult them in the matter', arabic: 'وشاورهم في الامر', category: 'Quran' },
  { english: 'Indeed the most honorable of you in the sight of Allah is the most pious', arabic: 'ان اكرمكم عند الله اتقاكم', category: 'Quran' },
  { english: 'And We made from water every living thing', arabic: 'وجعلنا من الماء كل شيء حي', category: 'Quran' },
  { english: 'And give glad tidings to the believers', arabic: 'وبشر المؤمنين', category: 'Quran' },
  { english: 'Do not spread corruption on earth', arabic: 'ولا تعثوا في الارض مفسدين', category: 'Quran' },
  { english: 'Give the relative his right', arabic: 'وات ذا القربى حقه', category: 'Quran' },
  { english: 'And do not waste wastefully', arabic: 'ولا تبذر تبذيرا', category: 'Quran' },
  { english: 'And lower your wing of humility', arabic: 'واخفض لهما جناح الذل', category: 'Quran' },
  { english: 'And be patient over what befalls you', arabic: 'واصبر على ما اصابك', category: 'Quran' },
  { english: 'The Hereafter is better for you than the first life', arabic: 'وللاخرة خير لك من الاولى', category: 'Quran' },

  // ── Islamic Knowledge
  { english: 'Islam has five pillars', arabic: 'الاسلام خمسة اركان', category: 'Islamic Knowledge' },
  { english: 'The first pillar is the testimony of faith', arabic: 'الركن الاول هو الشهادة', category: 'Islamic Knowledge' },
  { english: 'Prayer is performed five times daily', arabic: 'الصلاة تؤدى خمس مرات يوميا', category: 'Islamic Knowledge' },
  { english: 'Zakat purifies wealth', arabic: 'الزكاة تطهر المال', category: 'Islamic Knowledge' },
  { english: 'Fasting is in the month of Ramadan', arabic: 'الصيام في شهر رمضان', category: 'Islamic Knowledge' },
  { english: 'Hajj is obligatory once in a lifetime', arabic: 'الحج واجب مرة في العمر', category: 'Islamic Knowledge' },
  { english: 'The Prophet was born in Makkah', arabic: 'النبي ولد في مكة', category: 'Islamic Knowledge' },
  { english: 'The Kaaba is in Makkah', arabic: 'الكعبة في مكة', category: 'Islamic Knowledge' },
  { english: 'Al-Masjid al-Nabawi is in Madinah', arabic: 'المسجد النبوي في المدينة', category: 'Islamic Knowledge' },
  { english: 'Al-Aqsa mosque is in Jerusalem', arabic: 'المسجد الاقصى في القدس', category: 'Islamic Knowledge' },
  { english: 'Muslims fast from dawn to sunset', arabic: 'المسلمون يصومون من الفجر الى الغروب', category: 'Islamic Knowledge' },
  { english: 'Wudu is required before prayer', arabic: 'الوضوء مطلوب قبل الصلاة', category: 'Islamic Knowledge' },
  { english: 'Friday prayer is obligatory for men', arabic: 'صلاة الجمعة واجبة على الرجال', category: 'Islamic Knowledge' },
  { english: 'Ramadan is the ninth month', arabic: 'رمضان هو الشهر التاسع', category: 'Islamic Knowledge' },
  { english: 'Eid al-Fitr is after Ramadan', arabic: 'عيد الفطر بعد رمضان', category: 'Islamic Knowledge' },
  { english: 'Eid al-Adha is in Dhul Hijjah', arabic: 'عيد الاضحى في ذي الحجة', category: 'Islamic Knowledge' },
  { english: 'The Quran was revealed in Arabic', arabic: 'نزل القران باللغة العربية', category: 'Islamic Knowledge' },
  { english: 'Jibril brought the revelation', arabic: 'جبريل اتى بالوحي', category: 'Islamic Knowledge' },
  { english: 'Prayer is a direct connection to Allah', arabic: 'الصلاة تواصل مباشر مع الله', category: 'Islamic Knowledge' },
  { english: 'The Companions supported the Prophet', arabic: 'الصحابة ساندوا النبي', category: 'Islamic Knowledge' },

  // ── Simple Arabic Sentences
  { english: 'The book is on the table', arabic: 'الكتاب على الطاولة', category: 'Daily Life' },
  { english: 'The student is studying', arabic: 'الطالب يدرس', category: 'Daily Life' },
  { english: 'The teacher explained the lesson', arabic: 'المعلم شرح الدرس', category: 'Daily Life' },
  { english: 'The child is playing', arabic: 'الطفل يلعب', category: 'Daily Life' },
  { english: 'The mother is cooking', arabic: 'الام تطبخ', category: 'Daily Life' },
  { english: 'The father went to the mosque', arabic: 'الاب ذهب الى المسجد', category: 'Daily Life' },
  { english: 'The sun is shining', arabic: 'الشمس مشرقة', category: 'Daily Life' },
  { english: 'The sky is blue', arabic: 'السماء زرقاء', category: 'Daily Life' },
  { english: 'The water is cold', arabic: 'الماء بارد', category: 'Daily Life' },
  { english: 'The garden is green', arabic: 'الحديقة خضراء', category: 'Daily Life' },
  { english: 'This is a new book', arabic: 'هذا كتاب جديد', category: 'Daily Life' },
  { english: 'That is a big house', arabic: 'ذلك بيت كبير', category: 'Daily Life' },
  { english: 'I read a book every day', arabic: 'اقرا كتابا كل يوم', category: 'Daily Life' },
  { english: 'We pray five times a day', arabic: 'نصلي خمس مرات في اليوم', category: 'Daily Life' },
  { english: 'They are good students', arabic: 'هم طلاب جيدون', category: 'Daily Life' },
  { english: 'The door is open', arabic: 'الباب مفتوح', category: 'Daily Life' },
  { english: 'The window is closed', arabic: 'النافذة مغلقة', category: 'Daily Life' },
  { english: 'I drink water every morning', arabic: 'اشرب الماء كل صباح', category: 'Daily Life' },
  { english: 'My brother is a doctor', arabic: 'اخي طبيب', category: 'Daily Life' },
  { english: 'My sister is a teacher', arabic: 'اختي معلمة', category: 'Daily Life' },
  { english: 'The road is long', arabic: 'الطريق طويل', category: 'Daily Life' },
  { english: 'The lesson is easy', arabic: 'الدرس سهل', category: 'Daily Life' },
  { english: 'The exam is difficult', arabic: 'الامتحان صعب', category: 'Daily Life' },
  { english: 'I passed the exam', arabic: 'نجحت في الامتحان', category: 'Daily Life' },
  { english: 'The weather is hot today', arabic: 'الطقس حار اليوم', category: 'Daily Life' },

  // ── Grammar Sentences
  { english: 'He wrote a long letter', arabic: 'كتب رسالة طويلة', category: 'Grammar' },
  { english: 'She read an interesting book', arabic: 'قرات كتابا مثيرا', category: 'Grammar' },
  { english: 'The children played in the garden', arabic: 'لعب الاطفال في الحديقة', category: 'Grammar' },
  { english: 'The students answered the questions', arabic: 'اجاب الطلاب على الاسئلة', category: 'Grammar' },
  { english: 'The teacher gave homework', arabic: 'اعطى المعلم واجبا', category: 'Grammar' },
  { english: 'We went to the mosque on Friday', arabic: 'ذهبنا الى المسجد يوم الجمعة', category: 'Grammar' },
  { english: 'She helped her mother in the kitchen', arabic: 'ساعدت امها في المطبخ', category: 'Grammar' },
  { english: 'He memorized three surahs', arabic: 'حفظ ثلاث سور', category: 'Grammar' },
  { english: 'Are you a student', arabic: 'هل انت طالب', category: 'Grammar' },
  { english: 'Where is the library', arabic: 'اين المكتبة', category: 'Grammar' },
  { english: 'When is the exam', arabic: 'متى الامتحان', category: 'Grammar' },
  { english: 'What did you learn today', arabic: 'ماذا تعلمت اليوم', category: 'Grammar' },
  { english: 'I want to learn Arabic', arabic: 'اريد ان اتعلم العربية', category: 'Grammar' },
  { english: 'He can speak Arabic', arabic: 'يستطيع ان يتحدث العربية', category: 'Grammar' },
  { english: 'She must study more', arabic: 'يجب ان تدرس اكثر', category: 'Grammar' },
  { english: 'Do not be lazy', arabic: 'لا تكن كسولا', category: 'Grammar' },
  { english: 'Be patient and work hard', arabic: 'كن صبورا واعمل بجد', category: 'Grammar' },
  { english: 'Read more books', arabic: 'اقرا كتبا اكثر', category: 'Grammar' },

  // ── Hadith Phrases
  { english: 'Actions are by intentions', arabic: 'انما الاعمال بالنيات', category: 'Hadith' },
  { english: 'The best of you learns the Quran and teaches it', arabic: 'خيركم من تعلم القران وعلمه', category: 'Hadith' },
  { english: 'The religion is easy', arabic: 'الدين يسر', category: 'Hadith' },
  { english: 'Smiling at your brother is charity', arabic: 'تبسمك في وجه اخيك صدقة', category: 'Hadith' },
  { english: 'The strong man is not the wrestler', arabic: 'ليس الشديد بالصرعة', category: 'Hadith' },
  { english: 'Leave what makes you doubt', arabic: 'دع ما يريبك الى ما لا يريبك', category: 'Hadith' },
  { english: 'The world is a farm for the Hereafter', arabic: 'الدنيا مزرعة الاخرة', category: 'Hadith' },
  { english: 'Cleanliness is half of faith', arabic: 'الطهور شطر الايمان', category: 'Hadith' },
  { english: 'The best speech is the book of Allah', arabic: 'خير الكلام كلام الله', category: 'Hadith' },
  { english: 'Whoever is not grateful to people is not grateful to Allah', arabic: 'من لم يشكر الناس لم يشكر الله', category: 'Hadith' },

  // ── Nature and Creation
  { english: 'Allah created the heavens and the earth', arabic: 'خلق الله السماوات والارض', category: 'Creation' },
  { english: 'The stars are in the sky', arabic: 'النجوم في السماء', category: 'Creation' },
  { english: 'The trees give shade', arabic: 'الاشجار تعطي الظل', category: 'Creation' },
  { english: 'The river flows to the sea', arabic: 'النهر يجري الى البحر', category: 'Creation' },
  { english: 'The mountains are firm', arabic: 'الجبال راسخة', category: 'Creation' },
  { english: 'The birds sing in the morning', arabic: 'الطيور تغرد في الصباح', category: 'Creation' },
  { english: 'The flowers are colorful', arabic: 'الزهور ملونة', category: 'Creation' },
  { english: 'The earth is round', arabic: 'الارض كروية', category: 'Creation' },
  { english: 'The sea is deep', arabic: 'البحر عميق', category: 'Creation' },
  { english: 'The desert is vast', arabic: 'الصحراء شاسعة', category: 'Creation' },

  // ── Family
  { english: 'My father is kind', arabic: 'ابي طيب', category: 'Family' },
  { english: 'My mother is patient', arabic: 'امي صبورة', category: 'Family' },
  { english: 'My brother is older than me', arabic: 'اخي اكبر مني', category: 'Family' },
  { english: 'My sister studies medicine', arabic: 'اختي تدرس الطب', category: 'Family' },
  { english: 'My grandfather is wise', arabic: 'جدي حكيم', category: 'Family' },
  { english: 'My grandmother loves us', arabic: 'جدتي تحبنا', category: 'Family' },
  { english: 'The family prayed together', arabic: 'الاسرة صلت معا', category: 'Family' },
  { english: 'The children are sleeping', arabic: 'الاطفال نائمون', category: 'Family' },
  { english: 'The mother raises her children', arabic: 'الام تربي اولادها', category: 'Family' },
  { english: 'The father works to provide for his family', arabic: 'الاب يعمل لينفق على اسرته', category: 'Family' },

  // ── Education
  { english: 'I study at a university', arabic: 'ادرس في الجامعة', category: 'Education' },
  { english: 'The library has many books', arabic: 'المكتبة فيها كتب كثيرة', category: 'Education' },
  { english: 'I wrote an essay in Arabic', arabic: 'كتبت مقالا باللغة العربية', category: 'Education' },
  { english: 'The teacher corrected the homework', arabic: 'المعلم صحح الواجب', category: 'Education' },
  { english: 'I got a good grade', arabic: 'حصلت على درجة جيدة', category: 'Education' },
  { english: 'The classroom is large', arabic: 'الفصل الدراسي كبير', category: 'Education' },
  { english: 'The students are listening carefully', arabic: 'الطلاب يستمعون بانتباه', category: 'Education' },
  { english: 'Education is the path to success', arabic: 'التعليم هو طريق النجاح', category: 'Education' },
  { english: 'I will graduate next year', arabic: 'ساتخرج العام القادم', category: 'Education' },
  { english: 'Seek knowledge from the cradle to the grave', arabic: 'اطلب العلم من المهد الى اللحد', category: 'Education' },

  // ── Professions
  { english: 'The doctor treats the sick', arabic: 'الطبيب يعالج المرضى', category: 'Professions' },
  { english: 'The engineer designs buildings', arabic: 'المهندس يصمم المباني', category: 'Professions' },
  { english: 'The teacher teaches students', arabic: 'المعلم يعلم الطلاب', category: 'Professions' },
  { english: 'The judge rules with justice', arabic: 'القاضي يحكم بالعدل', category: 'Professions' },
  { english: 'The farmer plants crops', arabic: 'الفلاح يزرع المحاصيل', category: 'Professions' },
  { english: 'The writer writes books', arabic: 'الكاتب يكتب الكتب', category: 'Professions' },
  { english: 'The imam leads the prayer', arabic: 'الامام يؤم الصلاة', category: 'Professions' },
  { english: 'The merchant trades goods', arabic: 'التاجر يتاجر في البضائع', category: 'Professions' },

  // ── Islamic History
  { english: 'The Hijra was to Madinah', arabic: 'الهجرة كانت الى المدينة', category: 'History' },
  { english: 'Abu Bakr was the first caliph', arabic: 'ابو بكر كان الخليفة الاول', category: 'History' },
  { english: 'Umar was known for his justice', arabic: 'عمر كان معروفا بعدله', category: 'History' },
  { english: 'Ali was the cousin of the Prophet', arabic: 'علي كان ابن عم النبي', category: 'History' },
  { english: 'The Prophet was sent as a mercy to all worlds', arabic: 'النبي ارسل رحمة للعالمين', category: 'History' },
  { english: 'Islam began in Makkah', arabic: 'الاسلام بدأ في مكة', category: 'History' },
  { english: 'The Battle of Badr was in the second year', arabic: 'غزوة بدر كانت في السنة الثانية', category: 'History' },
  { english: 'Uthman compiled the Quran', arabic: 'عثمان جمع القران', category: 'History' },

  // ── Duas (Supplications)
  { english: 'My Lord increase me in knowledge', arabic: 'رب زدني علما', category: 'Dua' },
  { english: 'My Lord forgive me', arabic: 'رب اغفر لي', category: 'Dua' },
  { english: 'My Lord have mercy on them as they raised me', arabic: 'رب ارحمهما كما ربياني', category: 'Dua' },
  { english: 'Our Lord accept from us', arabic: 'ربنا تقبل منا', category: 'Dua' },
  { english: 'Our Lord give us good in this world and good in the Hereafter', arabic: 'ربنا اتنا في الدنيا حسنة وفي الاخرة حسنة', category: 'Dua' },
  { english: 'And protect us from the punishment of the Fire', arabic: 'وقنا عذاب النار', category: 'Dua' },
  { english: 'Our Lord do not make our hearts deviate after You have guided us', arabic: 'ربنا لا تزغ قلوبنا بعد اذ هديتنا', category: 'Dua' },
  { english: 'My Lord I seek refuge in You from laziness', arabic: 'ربي اعوذ بك من الكسل', category: 'Dua' },
  { english: 'O Allah guide me to the right path', arabic: 'اللهم اهدني الى الصراط المستقيم', category: 'Dua' },
  { english: 'O Allah make the Quran the spring of my heart', arabic: 'اللهم اجعل القران ربيع قلبي', category: 'Dua' },

  // ── Colors and Descriptions
  { english: 'The grass is green', arabic: 'العشب اخضر', category: 'Description' },
  { english: 'The rose is red', arabic: 'الوردة حمراء', category: 'Description' },
  { english: 'The snow is white', arabic: 'الثلج ابيض', category: 'Description' },
  { english: 'The night is dark', arabic: 'الليل مظلم', category: 'Description' },
  { english: 'The sun is bright', arabic: 'الشمس مضيئة', category: 'Description' },
  { english: 'The mountain is high', arabic: 'الجبل شاهق', category: 'Description' },
  { english: 'The road is narrow', arabic: 'الطريق ضيق', category: 'Description' },
  { english: 'The voice is beautiful', arabic: 'الصوت جميل', category: 'Description' },

  // ── Food and Markets
  { english: 'The food is delicious', arabic: 'الطعام لذيذ', category: 'Daily Life' },
  { english: 'I like rice with meat', arabic: 'احب الارز مع اللحم', category: 'Daily Life' },
  { english: 'The market is crowded', arabic: 'السوق مزدحم', category: 'Daily Life' },
  { english: 'I bought vegetables from the market', arabic: 'اشتريت الخضروات من السوق', category: 'Daily Life' },
  { english: 'The restaurant is full', arabic: 'المطعم ممتلئ', category: 'Daily Life' },
  { english: 'We ate breakfast together', arabic: 'تناولنا الافطار معا', category: 'Daily Life' },
  { english: 'I drink tea in the morning', arabic: 'اشرب الشاي في الصباح', category: 'Daily Life' },
  { english: 'The bread is fresh', arabic: 'الخبز طازج', category: 'Daily Life' },

  // ── Health
  { english: 'I went to the doctor', arabic: 'ذهبت الى الطبيب', category: 'Health' },
  { english: 'I have a headache', arabic: 'عندي صداع', category: 'Health' },
  { english: 'Exercise is beneficial for health', arabic: 'الرياضة مفيدة للصحة', category: 'Health' },
  { english: 'Eating vegetables is healthy', arabic: 'اكل الخضروات صحي', category: 'Health' },
  { english: 'Sleep is necessary for the body', arabic: 'النوم ضروري للجسم', category: 'Health' },
  { english: 'Good health is a blessing', arabic: 'الصحة الجيدة نعمة', category: 'Health' },
  { english: 'The heart pumps blood', arabic: 'القلب يضخ الدم', category: 'Health' },

  // ── Travel
  { english: 'I want to visit Makkah', arabic: 'اريد ان ازور مكة', category: 'Travel' },
  { english: 'The airport is far', arabic: 'المطار بعيد', category: 'Travel' },
  { english: 'The plane is flying', arabic: 'الطائرة تطير', category: 'Travel' },
  { english: 'The hotel is comfortable', arabic: 'الفندق مريح', category: 'Travel' },
  { english: 'The city is crowded', arabic: 'المدينة مزدحمة', category: 'Travel' },
  { english: 'The village is quiet', arabic: 'القرية هادئة', category: 'Travel' },
  { english: 'I visited the prophetic mosque', arabic: 'زرت المسجد النبوي', category: 'Travel' },
  { english: 'The desert is hot and dry', arabic: 'الصحراء حارة وجافة', category: 'Travel' },

  // ── Arabic Proverbs
  { english: 'Who plants reaps', arabic: 'من زرع حصد', category: 'Proverbs' },
  { english: 'Patience achieves goals', arabic: 'الصبر يحقق الاهداف', category: 'Proverbs' },
  { english: 'Prevention is better than cure', arabic: 'الوقاية خير من العلاج', category: 'Proverbs' },
  { english: 'Think before you speak', arabic: 'فكر قبل ان تتكلم', category: 'Proverbs' },
  { english: 'Actions speak louder than words', arabic: 'الافعال تتكلم اكثر من الكلمات', category: 'Proverbs' },
  { english: 'Every expert was once a beginner', arabic: 'كل خبير كان مبتدئا في يوم ما', category: 'Proverbs' },
  { english: 'Practice makes perfect', arabic: 'التدريب يصنع الاتقان', category: 'Proverbs' },
  { english: 'After every hardship comes relief', arabic: 'بعد كل عسر يسر', category: 'Proverbs' },
  { english: 'He who perseveres wins', arabic: 'من صبر ظفر', category: 'Proverbs' },
  { english: 'The tongue is the mirror of the mind', arabic: 'اللسان مرآة العقل', category: 'Proverbs' },

  // ── Islamic Finance and Law
  { english: 'Allah has permitted trade and forbidden interest', arabic: 'احل الله البيع وحرم الربا', category: 'Islamic Law' },
  { english: 'Give charity from what you love most', arabic: 'تصدق مما تحب', category: 'Islamic Law' },
  { english: 'Fulfill covenants and contracts', arabic: 'اوفوا بالعقود', category: 'Islamic Law' },
  { english: 'Give full measure and full weight', arabic: 'اوفوا الكيل والميزان', category: 'Islamic Law' },
  { english: 'Do not eat each other property unjustly', arabic: 'لا تاكلوا اموالكم بينكم بالباطل', category: 'Islamic Law' },

  // ── Arabic Language
  { english: 'Arabic is the language of the Quran', arabic: 'العربية لغة القران', category: 'Learning' },
  { english: 'I am studying Arabic for the Quran', arabic: 'ادرس العربية للقران', category: 'Learning' },
  { english: 'The Arabic alphabet has twenty eight letters', arabic: 'الابجدية العربية ثمانية وعشرون حرفا', category: 'Learning' },
  { english: 'Arabic reads from right to left', arabic: 'العربية تقرا من اليمين الى اليسار', category: 'Learning' },
  { english: 'Every Arabic word has a root', arabic: 'كل كلمة عربية لها جذر', category: 'Learning' },
  { english: 'I will read Quran every day', arabic: 'ساقرا القران كل يوم', category: 'Learning' },
  { english: 'Do you speak Arabic', arabic: 'هل تتكلم العربية', category: 'Learning' },
  { english: 'I am learning Arabic at home', arabic: 'انا اتعلم العربية في البيت', category: 'Learning' },
  { english: 'Can you speak slowly please', arabic: 'هل يمكنك التكلم ببطء من فضلك', category: 'Learning' },
  { english: 'What does this word mean', arabic: 'ما معنى هذه الكلمة', category: 'Learning' },
  { english: 'I did not understand', arabic: 'لم افهم', category: 'Learning' },
  { english: 'Please repeat once more', arabic: 'من فضلك كرر مرة اخرى', category: 'Learning' },

  // ── More Quranic Phrases (advanced)
  { english: 'Whoever does an atoms weight of good will see it', arabic: 'فمن يعمل مثقال ذرة خيرا يره', category: 'Quran' },
  { english: 'Whoever does an atoms weight of evil will see it', arabic: 'ومن يعمل مثقال ذرة شرا يره', category: 'Quran' },
  { english: 'And be steadfast in prayer', arabic: 'وحافظوا على الصلوات', category: 'Quran' },
  { english: 'Indeed prayer has been decreed upon believers', arabic: 'ان الصلاة كانت على المؤمنين كتابا موقوتا', category: 'Quran' },
  { english: 'Allah is with those who are patient', arabic: 'الله مع الصابرين', category: 'Quran' },
  { english: 'Do not lose hope in the mercy of Allah', arabic: 'لا تقنطوا من رحمة الله', category: 'Quran' },
  { english: 'Verily Allah is with the doers of good', arabic: 'ان الله مع المحسنين', category: 'Quran' },
  { english: 'And your Lord has decreed that you worship none but Him', arabic: 'وقضى ربك الا تعبدوا الا اياه', category: 'Quran' },
  { english: 'And He is the Forgiving the Merciful', arabic: 'وهو الغفور الرحيم', category: 'Quran' },
  { english: 'And He knows what is in the chests', arabic: 'وهو عليم بذات الصدور', category: 'Quran' },
  { english: 'O you who believe respond to Allah and the Messenger', arabic: 'يا ايها الذين امنوا استجيبوا لله وللرسول', category: 'Quran' },
  { english: 'And establish prayer at the two ends of the day', arabic: 'واقم الصلاة طرفي النهار', category: 'Quran' },
  { english: 'Indeed those who believe and do righteous deeds', arabic: 'ان الذين امنوا وعملوا الصالحات', category: 'Quran' },
  { english: 'And We have certainly created man in the best form', arabic: 'لقد خلقنا الانسان في احسن تقويم', category: 'Quran' },
  { english: 'The month of Ramadan in which the Quran was revealed', arabic: 'شهر رمضان الذي انزل فيه القران', category: 'Quran' },

  // ── Motivational Islamic
  { english: 'Never give up', arabic: 'لا تستسلم ابدا', category: 'Motivation' },
  { english: 'Keep going you can do it', arabic: 'استمر يمكنك ذلك', category: 'Motivation' },
  { english: 'Read every day', arabic: 'اقرا كل يوم', category: 'Motivation' },
  { english: 'Write every day', arabic: 'اكتب كل يوم', category: 'Motivation' },
  { english: 'Trust in Allah', arabic: 'توكل على الله', category: 'Motivation' },
  { english: 'Allah is sufficient for us', arabic: 'الله حسبنا', category: 'Motivation' },
  { english: 'The believer is strong', arabic: 'المؤمن قوي', category: 'Motivation' },
  { english: 'The believer does not despair', arabic: 'المؤمن لا يياس', category: 'Motivation' },
  { english: 'After every hardship comes ease', arabic: 'بعد كل شدة رخاء', category: 'Motivation' },
  { english: 'Rise up for success', arabic: 'قم الى الفلاح', category: 'Motivation' },
  { english: 'All praise is due to Allah', arabic: 'كل الحمد لله', category: 'Motivation' },
  { english: 'I rely on Allah', arabic: 'اتوكل على الله', category: 'Motivation' },

  // ── Numbers and Time
  { english: 'Today is Friday', arabic: 'اليوم هو الجمعة', category: 'Time' },
  { english: 'The week has seven days', arabic: 'الاسبوع سبعة ايام', category: 'Time' },
  { english: 'The year has twelve months', arabic: 'السنة اثنا عشر شهرا', category: 'Time' },
  { english: 'I wake up at five in the morning', arabic: 'استيقظ في الخامسة صباحا', category: 'Time' },
  { english: 'The month of Ramadan has thirty days', arabic: 'شهر رمضان ثلاثون يوما', category: 'Time' },
  { english: 'Prayer times are five each day', arabic: 'اوقات الصلاة خمسة في اليوم', category: 'Time' },

  // ── Short Classical Sentences
  { english: 'Knowledge without action is like a tree without fruit', arabic: 'العلم بلا عمل كشجرة بلا ثمر', category: 'Wisdom' },
  { english: 'The tongue is a small thing but it causes great disasters', arabic: 'اللسان شيء صغير يسبب كوارث كبيرة', category: 'Wisdom' },
  { english: 'He who knows himself knows his Lord', arabic: 'من عرف نفسه عرف ربه', category: 'Wisdom' },
  { english: 'The world is a passage and the Hereafter is the destination', arabic: 'الدنيا ممر والاخرة المستقر', category: 'Wisdom' },
  { english: 'Busy yourself with what benefits you', arabic: 'اشغل نفسك بما ينفعك', category: 'Wisdom' },
  { english: 'A good word is charity', arabic: 'الكلمة الطيبة صدقة', category: 'Wisdom' },
  { english: 'The best richness is richness of the soul', arabic: 'خير الغنى غنى النفس', category: 'Wisdom' },
  { english: 'Beware jealousy for it burns good deeds', arabic: 'احذر الحسد فانه ياكل الحسنات', category: 'Wisdom' },

  // ── Extra Sentences for 300+
  { english: 'I memorize Quran every morning', arabic: 'احفظ القران كل صباح', category: 'Daily Life' },
  { english: 'The mosque is near my house', arabic: 'المسجد قريب من بيتي', category: 'Daily Life' },
  { english: 'I love reading hadith books', arabic: 'احب قراءة كتب الحديث', category: 'Learning' },
  { english: 'The Arabic calligraphy is beautiful', arabic: 'الخط العربي جميل', category: 'Learning' },
  { english: 'He recited the Quran beautifully', arabic: 'تلا القران بصوت جميل', category: 'Daily Life' },
  { english: 'She fasted the whole month of Ramadan', arabic: 'صامت شهر رمضان كله', category: 'Islamic Knowledge' },
  { english: 'We listened to a beneficial lecture', arabic: 'استمعنا الى محاضرة مفيدة', category: 'Education' },
  { english: 'The new student learned quickly', arabic: 'الطالب الجديد تعلم بسرعة', category: 'Education' },
  { english: 'The Islamic school teaches Arabic and Quran', arabic: 'المدرسة الاسلامية تعلم العربية والقران', category: 'Education' },
  { english: 'I asked my teacher about Arabic grammar', arabic: 'سالت معلمي عن قواعد العربية', category: 'Education' },
  { english: 'The Quran is the greatest miracle of Islam', arabic: 'القران هو اعظم معجزات الاسلام', category: 'Islamic Knowledge' },
  { english: 'Every Muslim should learn Arabic', arabic: 'كل مسلم ينبغي ان يتعلم العربية', category: 'Islamic Knowledge' },
  { english: 'Understanding the Quran in Arabic is a great blessing', arabic: 'فهم القران بالعربية نعمة عظيمة', category: 'Islamic Knowledge' },
];

// ─── Keyboard Layout ─────────────────────────────────────────────────────────
const KEYBOARD_ROWS: string[][] = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ذ'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
];

const HARAKAT_ROW: string[] = ['َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ', 'ّ', 'ْ'];

// ─── Normalization ────────────────────────────────────────────────────────────
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F]/g, '') // Remove diacritics
    .replace(/[أإآٱ]/g, 'ا') // Normalize alif variants
    .replace(/ى/g, 'ي') // Normalize alif maqsura → ya
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Seed Leaderboard ─────────────────────────────────────────────────────────
const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Fatima A.', score: 143, date: '2026-03-10', correct: 10 },
  { name: 'Ibrahim K.', score: 127, date: '2026-03-12', correct: 9 },
  { name: 'Aisha M.', score: 118, date: '2026-03-11', correct: 9 },
  { name: 'Yusuf R.', score: 105, date: '2026-03-14', correct: 8 },
  { name: 'Maryam H.', score: 92, date: '2026-03-15', correct: 8 },
  { name: 'Omar S.', score: 88, date: '2026-03-16', correct: 7 },
  { name: 'Khadijah B.', score: 79, date: '2026-03-13', correct: 7 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ArabicTypingGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questions, setQuestions] = useState<Sentence[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hintUsed, setHintUsed] = useState(false);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | null>(null);
  const [allResults, setAllResults] = useState<RoundResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SEED_LEADERBOARD);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showHarakat, setShowHarakat] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancingRef = useRef(false);

  // Load leaderboard
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LeaderboardEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLeaderboard(parsed);
      }
    } catch {
      // Keep seed
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceQuestion = useCallback(
    (results: RoundResult[]) => {
      if (advancingRef.current) return;
      advancingRef.current = true;

      setTimeout(() => {
        setRoundResult(null);
        setHintUsed(false);
        setInput('');
        advancingRef.current = false;

        if (results.length >= QUESTIONS_PER_GAME) {
          setPhase('result');
        } else {
          setQIndex(results.length);
        }
      }, 1600);
    },
    []
  );

  const handleSubmit = useCallback(
    (timedOut = false) => {
      if (roundResult) return;
      stopTimer();

      const current = questions[qIndex];
      if (!current) return;

      const isCorrect =
        !timedOut &&
        input.trim().length > 0 &&
        normalizeArabic(input) === normalizeArabic(current.arabic);

      let points = 0;
      if (isCorrect) {
        const timeBonus = Math.min(10, Math.floor(timeLeft / 3));
        const streakBonus = streak >= 2 ? 5 : 0;
        const hintPenalty = hintUsed ? 4 : 0;
        points = Math.max(0, 10 + timeBonus + streakBonus - hintPenalty);
      }

      const result: RoundResult = {
        correct: isCorrect,
        points,
        expected: current.arabic,
        given: input,
      };

      setRoundResult(isCorrect ? 'correct' : 'wrong');
      setScore((prev) => prev + points);
      setStreak((prev) => (isCorrect ? prev + 1 : 0));

      const newResults = [...allResults, result];
      setAllResults(newResults);
      advanceQuestion(newResults);
    },
    [roundResult, stopTimer, questions, qIndex, input, timeLeft, streak, hintUsed, allResults, advanceQuestion]
  );

  // Timer effect — restarts on each new question
  useEffect(() => {
    if (phase !== 'playing') return;
    stopTimer();
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].seconds);
    advancingRef.current = false;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  // Focus the input when a new question starts
  useEffect(() => {
    if (phase === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, qIndex]);

  const startGame = () => {
    const shuffled = [...ALL_SENTENCES]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTIONS_PER_GAME);

    setQuestions(shuffled);
    setQIndex(0);
    setInput('');
    setScore(0);
    setStreak(0);
    setHintUsed(false);
    setRoundResult(null);
    setAllResults([]);
    setScoreSaved(false);
    setPlayerName('');
    advancingRef.current = false;
    setPhase('playing');
  };

  const addChar = (char: string) => {
    if (roundResult) return;
    setInput((prev) => prev + char);
    inputRef.current?.focus();
  };

  const deleteChar = () => {
    if (roundResult) return;
    setInput((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const useHint = () => {
    if (hintUsed || !questions[qIndex]) return;
    setHintUsed(true);
  };

  const saveScore = () => {
    if (!playerName.trim() || scoreSaved) return;

    const entry: LeaderboardEntry = {
      name: playerName.trim().slice(0, 20),
      score,
      date: new Date().toISOString().split('T')[0],
      correct: allResults.filter((r) => r.correct).length,
    };

    const updated = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    setLeaderboard(updated);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    setScoreSaved(true);
  };

  const current = questions[qIndex];
  const totalSeconds = DIFFICULTY_CONFIG[difficulty].seconds;
  const timerPercent = Math.round((timeLeft / totalSeconds) * 100);
  const correctCount = allResults.filter((r) => r.correct).length;
  const hintText = current ? current.arabic.slice(0, Math.ceil(current.arabic.length / 3)) : '';

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-600 p-2.5 text-white">
                <span className="text-2xl leading-none">ع</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-violet-900">Arabic Typing Challenge</h2>
                <p className="text-sm text-violet-700">
                  Type English sentences in Arabic — earn points, beat the clock!
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'game' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('game')}
                className={activeTab === 'game' ? 'bg-violet-600 hover:bg-violet-700' : ''}
              >
                Game
              </Button>
              <Button
                variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('leaderboard')}
                className={activeTab === 'leaderboard' ? 'bg-violet-600 hover:bg-violet-700' : ''}
              >
                <Trophy className="mr-1.5 h-4 w-4" />
                Leaderboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Leaderboard Tab ── */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-violet-900">
              <Trophy className="h-5 w-5 text-amber-500" />
              All-Time Leaderboard
            </CardTitle>
            <CardDescription>Top Arabic typing champions. Can you make it to the top?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(0, 15).map((entry, idx) => (
                <div
                  key={`${entry.name}-${idx}`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 border',
                    idx === 0 && 'border-amber-300 bg-amber-50',
                    idx === 1 && 'border-slate-300 bg-slate-50',
                    idx === 2 && 'border-orange-300 bg-orange-50',
                    idx > 2 && 'border-border bg-muted/30'
                  )}
                >
                  <div className="w-8 text-center font-bold text-lg">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.correct}/{QUESTIONS_PER_GAME} correct · {entry.date}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'text-white font-bold',
                      idx === 0 && 'bg-amber-500',
                      idx === 1 && 'bg-slate-500',
                      idx === 2 && 'bg-orange-600',
                      idx > 2 && 'bg-violet-600'
                    )}
                  >
                    {entry.score} pts
                  </Badge>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Play a game and save your score to appear here! — {ALL_SENTENCES.length} unique sentences in the pool.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Game Tab ── */}
      {activeTab === 'game' && (
        <>
          {/* ── MENU ── */}
          {phase === 'menu' && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const isSelected = difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'rounded-2xl border p-4 text-left transition-all',
                        isSelected
                          ? d === 'easy'
                            ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                            : d === 'medium'
                              ? 'border-amber-400 bg-amber-50 shadow-sm'
                              : 'border-red-400 bg-red-50 shadow-sm'
                          : 'border-border hover:border-violet-300'
                      )}
                    >
                      <p className="font-bold text-sm capitalize">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">{cfg.seconds}s per question</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Card className="border-violet-100">
                <CardContent className="p-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3 text-center">
                    {[
                      { icon: '📝', label: 'Sentences', value: `${ALL_SENTENCES.length}+` },
                      { icon: '❓', label: 'Per Game', value: `${QUESTIONS_PER_GAME} rounds` },
                      { icon: '⭐', label: 'Max per Round', value: '25 pts' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-muted/40 p-3">
                        <p className="text-2xl">{item.icon}</p>
                        <p className="text-lg font-bold mt-1">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 space-y-2">
                    <p className="text-sm font-semibold text-violet-900">How to score big:</p>
                    <ul className="space-y-1 text-sm text-violet-800">
                      <li className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />Answer fast for a time bonus (up to +10 pts)</li>
                      <li className="flex items-center gap-2"><Star className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />3 correct in a row = streak bonus (+5 pts)</li>
                      <li className="flex items-center gap-2"><Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />Using a hint costs 4 pts from your round score</li>
                      <li className="flex items-center gap-2"><span className="text-sm">ع</span> You can type using this keyboard OR your device keyboard</li>
                    </ul>
                  </div>

                  <Button
                    onClick={startGame}
                    className="w-full h-12 text-base font-bold bg-violet-600 hover:bg-violet-700"
                  >
                    Start Game
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── PLAYING ── */}
          {phase === 'playing' && current && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Question {qIndex + 1} of {QUESTIONS_PER_GAME}</span>
                    <span className="font-semibold text-violet-700">{score} pts</span>
                  </div>
                  <Progress
                    value={Math.round(((qIndex) / QUESTIONS_PER_GAME) * 100)}
                    className="h-2"
                  />
                </div>
                {streak >= 2 && (
                  <Badge className="bg-amber-500 text-white whitespace-nowrap">
                    <Zap className="h-3 w-3 mr-1" />
                    {streak}x Streak!
                  </Badge>
                )}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-amber-500' : 'text-muted-foreground'
                  )}
                />
                <Progress
                  value={timerPercent}
                  className={cn(
                    'h-2.5 flex-1',
                    timeLeft <= 5 ? '[&>div]:bg-red-500' : timeLeft <= 10 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums w-6 text-right',
                    timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-amber-500' : 'text-muted-foreground'
                  )}
                >
                  {timeLeft}
                </span>
              </div>

              {/* Question Card */}
              <Card
                className={cn(
                  'border-2 transition-all',
                  roundResult === 'correct' && 'border-emerald-400 bg-emerald-50',
                  roundResult === 'wrong' && 'border-red-400 bg-red-50',
                  roundResult === null && 'border-violet-200'
                )}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Category badge + question */}
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">{current.category}</Badge>
                    <p className="text-xl font-bold text-center py-2">{current.english}</p>
                  </div>

                  {/* Hint */}
                  {hintUsed && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center">
                      <p className="text-xs text-amber-700 mb-1">Hint (−4 pts): starts with...</p>
                      <p className="arabic-text text-2xl text-amber-800" dir="rtl">{hintText}...</p>
                    </div>
                  )}

                  {/* Result feedback */}
                  {roundResult === 'correct' && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-100 p-3">
                      <Check className="h-5 w-5 text-emerald-600" />
                      <p className="font-bold text-emerald-800">Correct! Well done!</p>
                    </div>
                  )}
                  {roundResult === 'wrong' && (
                    <div className="rounded-lg bg-red-50 p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <p className="font-bold text-red-800">Not quite — correct answer:</p>
                      </div>
                      <p className="arabic-text text-xl text-red-900 text-center" dir="rtl">{current.arabic}</p>
                    </div>
                  )}

                  {/* Input field */}
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      if (!roundResult) setInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !roundResult) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="اكتب هنا..."
                    dir="rtl"
                    className="text-right text-lg h-12 arabic-text"
                    disabled={!!roundResult}
                  />

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {!hintUsed && !roundResult && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={useHint}
                        className="text-amber-700 border-amber-300"
                      >
                        <Lightbulb className="mr-1.5 h-4 w-4" />
                        Hint (−4 pts)
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={!!roundResult || !input.trim()}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                      Submit Answer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Arabic On-Screen Keyboard */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Arabic Keyboard — click to type
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHarakat((v) => !v)}
                      className="text-xs h-7 px-2"
                    >
                      {showHarakat ? 'Hide' : 'Show'} Tashkeel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1.5">
                  {KEYBOARD_ROWS.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-1 flex-wrap">
                      {row.map((key) => (
                        <button
                          key={key}
                          onClick={() => addChar(key)}
                          disabled={!!roundResult}
                          className={cn(
                            'min-w-[2.2rem] h-10 rounded-lg border px-1.5 font-bold text-base transition-all',
                            'arabic-text bg-white hover:bg-violet-50 active:scale-95 border-slate-200 hover:border-violet-300 disabled:opacity-40',
                            key === 'لا' && 'min-w-[3rem]'
                          )}
                          dir="rtl"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}

                  {/* Tashkeel row */}
                  {showHarakat && (
                    <div className="flex justify-center gap-1 flex-wrap pt-1 border-t border-dashed border-slate-200">
                      {HARAKAT_ROW.map((key) => (
                        <button
                          key={key}
                          onClick={() => addChar(key)}
                          disabled={!!roundResult}
                          className="w-10 h-10 rounded-lg border border-slate-200 bg-amber-50 hover:bg-amber-100 active:scale-95 text-sm font-bold disabled:opacity-40"
                          dir="rtl"
                        >
                          بـ{key}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Control row */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={deleteChar}
                      disabled={!!roundResult}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-red-50 hover:bg-red-100 active:scale-95 px-3 h-10 text-xs font-semibold text-red-700 disabled:opacity-40"
                    >
                      <Delete className="h-4 w-4" />
                      Del
                    </button>
                    <button
                      onClick={() => !roundResult && setInput((p) => p + ' ')}
                      disabled={!!roundResult}
                      className="flex-1 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 active:scale-95 h-10 text-xs font-semibold text-muted-foreground disabled:opacity-40"
                    >
                      <Space className="h-4 w-4 inline mr-1" />
                      Space
                    </button>
                    <button
                      onClick={() => !roundResult && setInput('')}
                      disabled={!!roundResult}
                      className="rounded-lg border border-slate-200 bg-white hover:bg-red-50 active:scale-95 px-3 h-10 text-xs font-semibold text-muted-foreground disabled:opacity-40"
                    >
                      Clear
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── RESULTS ── */}
          {phase === 'result' && (
            <div className="space-y-4">
              {/* Score Card */}
              <Card
                className={cn(
                  'border-2 text-center',
                  correctCount >= 8 ? 'border-emerald-400 bg-emerald-50' :
                    correctCount >= 5 ? 'border-amber-400 bg-amber-50' :
                      'border-slate-300'
                )}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="text-5xl">
                    {correctCount >= 9 ? '🏆' : correctCount >= 7 ? '⭐' : correctCount >= 5 ? '👍' : '💪'}
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold">{score} pts</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {correctCount} of {QUESTIONS_PER_GAME} correct
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {correctCount === 10
                      ? 'Perfect game! You are a master!'
                      : correctCount >= 8
                        ? 'Excellent work — almost perfect!'
                        : correctCount >= 6
                          ? 'Great effort! Keep practising!'
                          : correctCount >= 4
                            ? 'Good start — Arabic takes time!'
                            : 'Keep going — every mistake is a lesson!'}
                  </p>
                </CardContent>
              </Card>

              {/* Results breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Round Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allResults.map((res, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border px-4 py-3',
                        res.correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-100 bg-red-50'
                      )}
                    >
                      {res.correct
                        ? <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        : <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{questions[i]?.english}</p>
                        <p className="arabic-text text-base text-muted-foreground" dir="rtl">{res.expected}</p>
                        {!res.correct && res.given && (
                          <p className="text-xs text-red-600 mt-0.5">
                            Your answer: <span className="arabic-text" dir="rtl">{res.given || '(no answer)'}</span>
                          </p>
                        )}
                      </div>
                      {res.correct && (
                        <Badge className="bg-emerald-600 text-white whitespace-nowrap">+{res.points}</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Save score */}
              <Card className="border-violet-100">
                <CardContent className="p-5 space-y-3">
                  {!scoreSaved ? (
                    <>
                      <p className="text-sm font-semibold">Save your score to the leaderboard</p>
                      <div className="flex gap-2">
                        <Input
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                          placeholder="Your name (max 20 chars)"
                          onKeyDown={(e) => e.key === 'Enter' && saveScore()}
                          maxLength={20}
                        />
                        <Button
                          onClick={saveScore}
                          disabled={!playerName.trim()}
                          className="bg-violet-600 hover:bg-violet-700 whitespace-nowrap"
                        >
                          <Medal className="mr-1.5 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-5 w-5" />
                      <p className="font-semibold">Score saved! Check the leaderboard.</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={startGame}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Play Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab('leaderboard');
                        setPhase('menu');
                      }}
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      Leaderboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
