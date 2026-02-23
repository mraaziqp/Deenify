"use client";
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookUploadForm } from '@/components/admin/book-upload-form';
import { RecipeUploadForm } from '@/components/admin/recipe-upload-form';

export default function AdminContentPage() {
  const { user, hasRole, isLoading } = useAuth();
  if (!isLoading && (!user || !hasRole('admin'))) {
    redirect('/');
  }
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Content Uploader</h1>
      <Tabs defaultValue="book" className="w-full">
        <TabsList>
          <TabsTrigger value="book">Upload Book</TabsTrigger>
          <TabsTrigger value="recipe">Upload Recipe</TabsTrigger>
        </TabsList>
        <TabsContent value="book">
          <BookUploadForm />
        </TabsContent>
        <TabsContent value="recipe">
          <RecipeUploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
