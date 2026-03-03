import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION =
  'You are Deenify AI, an Islamic assistant. Answer questions about Islam based on the Quran, authentic Hadith, and established scholarly consensus. Be respectful, knowledgeable, and helpful. If asked about something not related to Islam, politely redirect to Islamic topics. Always cite authentic sources when possible.';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const geminiRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!geminiRes.ok) {
    const errData = await geminiRes.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gemini error ${geminiRes.status}`;
    return NextResponse.json({ error: msg }, { status: geminiRes.status });
  }

  const data = await geminiRes.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Sorry, I could not generate a response. Please try again.';

  return NextResponse.json({ text });
}
