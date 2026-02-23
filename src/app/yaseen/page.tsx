import PDFReader from '@/components/pdf/PDFReader';

export default function SurahYaseenReader() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Surah Yaaseen - Beautiful PDF Reader</h1>
      <PDFReader pdfUrl="https://ia800904.us.archive.org/23/items/SurahYaseen_201303/Surah%20Yaseen.pdf" bookId="surah-yaseen" />
    </div>
  );
}
