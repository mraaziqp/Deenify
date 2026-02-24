
import useSWR from 'swr';
import { CheckCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function QnAFeed() {
  const { data } = useSWR('/api/qna', fetcher);
  const questions = data?.questions || [];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Community QnA Feed</h1>
      <ul className="space-y-6">
        {questions.map((q: any) => (
          <li key={q.id} className="bg-white rounded-lg shadow p-6">
            <div className="mb-2">
              <span className="font-semibold text-lg">{q.content}</span>
              <span className="ml-2 text-xs text-gray-400">Asked: {new Date(q.createdAt).toLocaleDateString()}</span>
            </div>
            {q.answers.length > 0 ? (
              q.answers.map((a: any) => (
                <div key={a.id} className="mt-4 border-t pt-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <div className="font-medium text-emerald-700 flex items-center gap-2">
                      {a.scholar?.email || 'Scholar'}
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                        Verified Scholar
                      </span>
                    </div>
                    <div className="text-gray-700 mt-1">{a.content}</div>
                    <div className="text-xs text-gray-400 mt-1">Answered: {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 mt-2">No answers yet.</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
