"use client";
import { useState, useRef, useEffect } from 'react';

// API calls go through /api/ai-chat (server-side) — key is never exposed to the browser

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const userMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `API error ${res.status}`);
      }

      const data = await res.json();
      const aiText = data?.text || 'Sorry, I could not generate a response. Please try again.';
      setMessages((msgs) => [...msgs, { role: 'assistant', content: aiText }]);
    } catch (err: any) {
      setError(err?.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-0 rounded-2xl shadow-xl overflow-hidden border border-primary/20 bg-white">
      {/* Header */}
      <div className="relative overflow-hidden px-6 py-5" style={{background:'linear-gradient(135deg,#0a4a36 0%,#065f46 50%,#1e5f74 100%)'}}>
        <div className="absolute top-1 right-5 select-none" style={{color:'rgba(251,191,36,0.2)',fontSize:'3.5rem',lineHeight:1}}>✦</div>
        <div className="relative z-10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">🕌</span> Deenify AI Assistant
          </h2>
          <p className="text-emerald-200 text-sm mt-0.5">Ask about Islam, Quran, Hadith, Fiqh &amp; more</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 h-[420px] overflow-y-auto px-4 py-4 bg-gradient-to-b from-teal-50/40 to-white">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm pt-8">
            <div className="text-4xl mb-3">🌙</div>
            <p className="font-medium text-base">Assalamu Alaykum!</p>
            <p className="mt-1">Ask me anything about Islam. I&apos;m here to help.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm mx-auto text-xs">
              {['What is Zakat?', 'How to perform Wudu?', 'What is Surah Al-Fatiha about?', 'Best dua for anxiety?'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="border border-teal-200 rounded-lg px-3 py-2 text-teal-700 hover:bg-teal-50 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">AI</div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-sm'
                  : 'bg-white border border-teal-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">AI</div>
            <div className="bg-white border border-teal-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-teal-100 bg-white">
        <input
          className="flex-1 border border-teal-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          placeholder="Ask about Islam..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
