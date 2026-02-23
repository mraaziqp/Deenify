import PDFReader from '@/components/pdf/PDFReader';

export default function AlMufeedahReader() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Al Mufeedah - Beautiful PDF Reader</h1>
      <PDFReader pdfUrl="https://ia802508.us.archive.org/23/items/almufeedah/almufeedah.pdf" bookId="almufeedah" />
    </div>
  );
}
