"use client";
import { useState } from 'react';

const API_KEY = 'AIzaSyDRLDH5GUH-vmgdsBLNv0csrjuz8Bzhli8';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY;

export function AiAssistantChat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are an Islamic AI Assistant. Answer questions about Islam based on authentic sources.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const userMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: input }] }],
        }),
      });
      const data = await res.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages((msgs) => [...msgs, { role: 'assistant', content: aiText }]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-50 text-right' : 'bg-green-50 text-left'}`}>
            <span className="font-semibold">{msg.role === 'user' ? 'You' : 'AI'}:</span> {msg.content}
          </div>
        ))}
        {loading && <div className="text-center text-muted-foreground">Thinking...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask a question about Islam..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
