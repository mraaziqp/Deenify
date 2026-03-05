import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION =
  'You are Deenify AI, an Islamic assistant. Answer questions about Islam based on the Quran, authentic Hadith, and established scholarly consensus. Be respectful, knowledgeable, and helpful. If asked about something not related to Islam, politely redirect to Islamic topics. Always cite authentic sources when possible.';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 });
  }

  let messages: { role: string; content: string }[];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.messages)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    messages = body.messages;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Try models in order of preference until one succeeds
  // Verified working models for this API key (as of 2026-03)
  const MODELS = [
    'gemini-2.5-flash',   // best available — confirmed working
    'gemini-flash-latest', // stable alias fallback
  ];

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  for (const model of MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      if (geminiRes.status === 404 || geminiRes.status === 400) {
        // Model not found or not supported — try next
        continue;
      }

      if (!geminiRes.ok) {
        const errData = await geminiRes.json().catch(() => ({}));
        const msg = (errData as any)?.error?.message || `Gemini error ${geminiRes.status}`;
        return NextResponse.json({ error: msg }, { status: geminiRes.status });
      }

      const data = await geminiRes.json();
      const parts = (data as any)?.candidates?.[0]?.content?.parts as Array<{ text?: string; thought?: boolean }> | undefined;
      // For thinking models, find the non-thought part; for flash models parts[0] is always the answer
      const text =
        parts?.find((p) => p.text && !p.thought)?.text ||
        parts?.[0]?.text ||
        'Sorry, I could not generate a response. Please try again.';
      return NextResponse.json({ text });
    } catch {
      continue;
    }
  }

  // All models failed
  return NextResponse.json(
    { error: 'I am currently offline making some upgrades. Please try again later!' },
    { status: 503 }
  );
}
