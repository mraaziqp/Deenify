import { notFound } from 'next/navigation';
import { AwradReader } from '@/components/awrad-reader';

async function getChapter(chapterId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/awrad/chapter/${chapterId}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function AwradReadPage({ params }: { params: { chapterId: string } }) {
  const chapter = await getChapter(params.chapterId);
  if (!chapter) return notFound();
  return <AwradReader chapter={chapter} />;
}
