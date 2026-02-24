"use client";
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ScholarQnATab() {
  const { data, mutate } = useSWR('/api/scholar/qna', fetcher);
  const questions = data?.questions || [];
  const [answer, setAnswer] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    const res = await fetch('/api/scholar/qna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: selectedId, answer }),
    });
    if (res.ok) {
      setSuccess('Answer published!');
      mutate();
      setSelectedId(null);
      setAnswer('');
    } else {
      setSuccess('Failed to publish answer.');
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-emerald-600 mb-4">Unanswered Community Questions</h2>
      <ul className="space-y-4 mb-6">
        {questions.length === 0 && (
          <li className="text-gray-500">No unanswered questions. 🎉</li>
        )}
        {questions.map((q: any) => (
          <li key={q.id} className="border rounded p-4 flex flex-col gap-2 bg-gray-50">
            <span className="font-medium text-lg">{q.content}</span>
            <span className="text-xs text-gray-400">Asked: {new Date(q.createdAt).toLocaleDateString()}</span>
            <Button size="sm" className="bg-emerald-500 text-white mt-2" onClick={() => setSelectedId(q.id)}>
              Answer
            </Button>
          </li>
        ))}
      </ul>
      {selectedId && (
        <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-3 mb-4">
          <Textarea
            placeholder="Type your answer, cite sources, and publish..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            required
            className="min-h-[120px]"
          />
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Answer'}
          </Button>
        </form>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <CheckCircle className="w-5 h-5" /> {success}
        </div>
      )}
    </div>
  );
}
