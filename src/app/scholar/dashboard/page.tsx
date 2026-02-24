import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ScholarUploadTab from './upload-tab';
import ScholarQnATab from './qna-tab';

export default function ScholarDashboard() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Scholar Dashboard</h1>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="flex justify-center gap-4 mb-8">
          <TabsTrigger value="upload">Upload Books/Coursework</TabsTrigger>
          <TabsTrigger value="qna">QnA Answer Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <ScholarUploadTab />
        </TabsContent>
        <TabsContent value="qna">
          <ScholarQnATab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
