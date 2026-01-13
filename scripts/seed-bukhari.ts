
import * as admin from 'firebase-admin';
import axios from 'axios';
import { MultiBar, Presets } from 'cli-progress';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// 1. Initialize Firebase Admin (Service Account required for local scripts)
// Ensure you have your 'service-account.json' from Firebase Console > Project Settings > Service Accounts
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK. Make sure 'service-account.json' is in the root directory.");
    process.exit(1);
  }
}

const db = admin.firestore();

// 2. The Source URL (Verified GitHub JSON)
const BUKHARI_JSON_URL = 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/bukhari.json';

interface HadithSource {
  id: number;
  arabic: string;
  english: {
    narrator: string;
    text: string;
  };
  chapterId: number;
  bookId: number;
}

async function seedBukhari() {
  console.log('🚀 Starting Seeding Engine: Sahih Al-Bukhari...');

  // Step 1: Fetch Data
  console.log('📥 Fetching raw JSON...');
  const { data } = await axios.get<HadithSource[]>(BUKHARI_JSON_URL);
  const totalHadiths = data.length;
  console.log(`✅ Fetched ${totalHadiths} hadiths.`);

  // Step 2: Setup Batching
  const BATCH_SIZE = 500; // Firestore limit
  const progressBar = new MultiBar({}, Presets.shades_classic);
  const b1 = progressBar.create(totalHadiths, 0, {status: 'Batching...'});

  console.log('⚙️ Processing and batching writes...');

  // Step 3: Process in Chunks
  for (let i = 0; i < totalHadiths; i += BATCH_SIZE) {
    const chunk = data.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach((hadith) => {
      // Create a clean Knowledge Node ID
      const docId = `bukhari_${hadith.id}`;
      const docRef = db.collection('knowledge_nodes').doc(docId);

      // Map to our Schema
      batch.set(docRef, {
        id: docId,
        type: 'hadith',
        source_book: 'Sahih al-Bukhari',
        hadith_number: hadith.id,
        content: {
          ar: hadith.arabic,
          en: hadith.english.text,
        },
        narrator: hadith.english.narrator,
        // We add keywords for Genkit later
        metadata: {
          chapter_id: hadith.chapterId,
          verified: true,
        }
      });
    });

    // Commit the batch
    await batch.commit();
    b1.increment(chunk.length);
  }

  progressBar.stop();
  console.log('\n✨ Seeding Complete. The \'Ilm Engine is now populated with Sahih al-Bukhari.');
}

seedBukhari().catch(error => {
    console.error("\n❌ An error occurred during seeding:", error.message);
    if(error.code === 'ENOENT'){
        console.error("Hint: Did you forget to create the service-account.json file?");
    }
});
