'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, FileText, HelpCircle, ImageIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const resourceTypes = [
  { value: 'pdf', label: 'PDF' },
  { value: 'book', label: 'Book' },
] as const;

type ResourceType = (typeof resourceTypes)[number]['value'];

type LearningResource = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  url: string;
  coverImageUrl?: string | null;
  author?: string | null;
  language?: string | null;
  pageCount?: number | null;
  tags?: string[];
  published: boolean;
};

type LearningQuestion = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  question: string;
  aiAnswer?: string | null;
  approvedAnswer?: string | null;
  status: string;
  createdAt: string;
};

type UploadResponse = {
  uploadUrl: string;
  publicUrl: string;
  path: string;
};

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function LearningPage() {
  const { user, hasRole, isLoading } = useAuth();
  const isAdmin = hasRole('admin');
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [questions, setQuestions] = useState<LearningQuestion[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [showMyQuestions, setShowMyQuestions] = useState(false);

  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('pdf');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceCoverUrl, setResourceCoverUrl] = useState('');
  const [resourceAuthor, setResourceAuthor] = useState('');
  const [resourceLanguage, setResourceLanguage] = useState('');
  const [resourcePageCount, setResourcePageCount] = useState('');
  const [resourceTags, setResourceTags] = useState('');
  const [resourcePublished, setResourcePublished] = useState(true);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`/api/learning/resources${isAdmin ? '?all=true' : ''}`);
        if (!response.ok) return;
        const data = await response.json();
        setResources(Array.isArray(data.resources) ? data.resources : []);
      } catch (error) {
        console.error('Failed to load resources:', error);
      }
    };

    const fetchQuestions = async () => {
      try {
        const params = new URLSearchParams();
        if (isAdmin && !showMyQuestions) {
          params.set('all', 'true');
        } else if (showMyQuestions && user?.id) {
          params.set('mine', 'true');
          params.set('userId', user.id);
        }

        const query = params.toString();
        const response = await fetch(`/api/learning/questions${query ? `?${query}` : ''}`);
        if (!response.ok) return;
        const data = await response.json();
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    if (!isLoading) {
      void fetchResources();
      void fetchQuestions();
    }
  }, [isAdmin, isLoading, showMyQuestions, user?.id]);

  const filteredResources = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    return resources.filter((resource) => {
      if (selectedType !== 'all' && resource.type !== selectedType) return false;
      if (!query) return true;
      return [resource.title, resource.author, resource.language, resource.tags?.join(' ')]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(query));
    });
  }, [librarySearch, resources, selectedType]);

  const resetResourceForm = () => {
    setEditingResourceId(null);
    setResourceTitle('');
    setResourceDescription('');
    setResourceType('pdf');
    setResourceUrl('');
    setResourceCoverUrl('');
    setResourceAuthor('');
    setResourceLanguage('');
    setResourcePageCount('');
    setResourceTags('');
    setResourcePublished(true);
    setResourceFile(null);
    setCoverFile(null);
  };

  const handleSaveResource = async () => {
    if (!resourceTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!resourceUrl.trim()) {
      toast.error('Resource URL is required');
      return;
    }

    const payload = {
      title: resourceTitle.trim(),
      description: resourceDescription.trim() || undefined,
      type: resourceType,
      url: resourceUrl.trim(),
      coverImageUrl: resourceCoverUrl.trim() || undefined,
      author: resourceAuthor.trim() || undefined,
      language: resourceLanguage.trim() || undefined,
      pageCount: parseNumber(resourcePageCount),
      tags: resourceTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      published: resourcePublished,
    };

    try {
      const response = await fetch(
        editingResourceId ? `/api/learning/resources/${editingResourceId}` : '/api/learning/resources',
        {
          method: editingResourceId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        toast.error('Unable to save resource');
        return;
      }

      const data = await response.json();
      const resource = (data.resource || data.resources) as LearningResource;
      const nextResources = editingResourceId
        ? resources.map((item) => (item.id === editingResourceId ? resource : item))
        : [resource, ...resources];

      setResources(nextResources);
      resetResourceForm();
      toast.success(editingResourceId ? 'Resource updated' : 'Resource added');
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast.error('Unable to save resource');
    }
  };

  const handleEditResource = (resource: LearningResource) => {
    setEditingResourceId(resource.id);
    setResourceTitle(resource.title);
    setResourceDescription(resource.description || '');
    setResourceType(resource.type === 'book' ? 'book' : 'pdf');
    setResourceUrl(resource.url);
    setResourceCoverUrl(resource.coverImageUrl || '');
    setResourceAuthor(resource.author || '');
    setResourceLanguage(resource.language || '');
    setResourcePageCount(resource.pageCount?.toString() || '');
    setResourceTags(resource.tags?.join(', ') || '');
    setResourcePublished(resource.published);
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/learning/resources/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        toast.error('Unable to delete resource');
        return;
      }
      setResources(resources.filter((resource) => resource.id !== id));
      toast.success('Resource removed');
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Unable to delete resource');
    }
  };

  const handleUpload = async (file: File, mediaType: 'pdf' | 'image') => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/admin/learning/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          mediaType,
        }),
      });

      if (!response.ok) {
        toast.error('Upload setup failed');
        return;
      }

      const payload = (await response.json()) as UploadResponse;
      const uploadResult = await fetch(payload.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResult.ok) {
        toast.error('Upload failed');
        return;
      }

      if (mediaType === 'pdf') {
        setResourceUrl(payload.publicUrl);
      } else {
        setResourceCoverUrl(payload.publicUrl);
      }
      toast.success('Upload complete');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;
    setSubmittingQuestion(true);
    try {
      const response = await fetch('/api/learning/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          userId: user?.id,
          userName: user?.name,
        }),
      });

      if (!response.ok) {
        toast.error('Unable to submit question');
        return;
      }

      const data = await response.json();
      const question = data.question as LearningQuestion;
      setQuestions([question, ...questions]);
      setQuestionText('');
      toast.success('Question submitted');
    } catch (error) {
      console.error('Failed to submit question:', error);
      toast.error('Unable to submit question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleApproveAnswer = async (question: LearningQuestion, approvedAnswer: string) => {
    if (!approvedAnswer.trim()) {
      toast.error('Approved answer cannot be empty');
      return;
    }
    try {
      const response = await fetch(`/api/learning/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedAnswer, status: 'approved' }),
      });

      if (!response.ok) {
        toast.error('Unable to approve answer');
        return;
      }

      const data = await response.json();
      const updated = data.question as LearningQuestion;
      setQuestions(questions.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Answer approved');
    } catch (error) {
      console.error('Failed to approve answer:', error);
      toast.error('Unable to approve answer');
    }
  };

  const renderAnswer = (question: LearningQuestion) => {
    if (question.approvedAnswer) return question.approvedAnswer;
    if (question.aiAnswer) return question.aiAnswer;
    return 'Awaiting response.';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Library</h1>
        <p className="text-muted-foreground">
          Browse Islamic PDFs and books, then ask questions with AI-assisted answers.
        </p>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">
            <BookOpen className="h-4 w-4 mr-2" />
            Library
          </TabsTrigger>
          <TabsTrigger value="qa">
            <HelpCircle className="h-4 w-4 mr-2" />
            Q&A
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Explore Resources</CardTitle>
              <CardDescription>Search by title, author, or topic.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                placeholder="Search resources..."
                value={librarySearch}
                onChange={(event) => setLibrarySearch(event.target.value)}
              />
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ResourceType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {resourceTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <Badge variant="outline">{resource.type.toUpperCase()}</Badge>
                  </div>
                  <CardDescription>{resource.description || 'No description provided.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Author: {resource.author || 'Unknown'}</p>
                    <p>Language: {resource.language || 'N/A'}</p>
                    <p>Pages: {resource.pageCount || 'N/A'}</p>
                  </div>
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Badge key={`${resource.id}-${tag}`} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button asChild className="w-full">
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Open Resource
                    </a>
                  </Button>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEditResource(resource)}>
                        Edit
                      </Button>
                      <Button variant="outline" onClick={() => handleDeleteResource(resource.id)}>
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredResources.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No resources found yet.
                </CardContent>
              </Card>
            )}
          </div>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin: Manage Resources</CardTitle>
                <CardDescription>Add or update PDFs and books for learners.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={resourceType} onValueChange={(value) => setResourceType(value as ResourceType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={resourceDescription}
                    onChange={(event) => setResourceDescription(event.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Resource URL</Label>
                    <Input value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Image URL</Label>
                    <Input value={resourceCoverUrl} onChange={(event) => setResourceCoverUrl(event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input value={resourceAuthor} onChange={(event) => setResourceAuthor(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input value={resourceLanguage} onChange={(event) => setResourceLanguage(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Page count</Label>
                    <Input value={resourcePageCount} onChange={(event) => setResourcePageCount(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input value={resourceTags} onChange={(event) => setResourceTags(event.target.value)} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-semibold">Published</p>
                    <p className="text-xs text-muted-foreground">Toggle resource visibility.</p>
                  </div>
                  <Switch checked={resourcePublished} onCheckedChange={setResourcePublished} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Upload PDF</Label>
                    <Input type="file" accept="application/pdf" onChange={(event) => setResourceFile(event.target.files?.[0] || null)} />
                    <Button
                      variant="outline"
                      onClick={() => resourceFile && handleUpload(resourceFile, 'pdf')}
                      disabled={isUploading || !resourceFile}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Cover Image</Label>
                    <Input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
                    <Button
                      variant="outline"
                      onClick={() => coverFile && handleUpload(coverFile, 'image')}
                      disabled={isUploading || !coverFile}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSaveResource}>
                    {editingResourceId ? 'Update Resource' : 'Add Resource'}
                  </Button>
                  {editingResourceId && (
                    <Button variant="outline" onClick={resetResourceForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="qa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>Receive AI guidance, then admins can review and approve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Switch checked={showMyQuestions} onCheckedChange={setShowMyQuestions} />
                <Label className="text-xs text-muted-foreground">
                  {isAdmin ? 'Show only my questions' : 'Show my questions'}
                </Label>
              </div>
              <Textarea
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                rows={3}
                placeholder="Ask about Islamic topics, rulings, or guidance..."
              />
              <Button onClick={handleAskQuestion} disabled={submittingQuestion}>
                {submittingQuestion ? 'Submitting...' : 'Ask Question'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{question.question}</CardTitle>
                    <Badge variant={question.status === 'approved' ? 'default' : 'secondary'}>
                      {question.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(question.createdAt).toLocaleString()}
                    {isAdmin && question.userName && (
                      <span className="ml-2">• Asked by {question.userName}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{renderAnswer(question)}</p>
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label>Approved Answer</Label>
                      <Textarea
                        defaultValue={question.approvedAnswer || question.aiAnswer || ''}
                        rows={3}
                        onBlur={(event) => handleApproveAnswer(question, event.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Blur the field to approve and publish the answer.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {questions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No questions yet. Be the first to ask.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
