import { NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  'deepseek/deepseek-r1-0528:free',
];

async function callOpenRouter(
  model: string,
  prompt: string,
  apiKey?: string,
  referer?: string
) {
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing');
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer || '',
      'X-Title': 'DevSync',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a strict JSON generator. Respond ONLY with a valid JSON array.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is missing' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { scope, file, language, code, range } = body ?? {};

    if (!file || typeof file !== 'string') {
      return NextResponse.json(
        { error: 'Missing file' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Missing code' },
        { status: 400 }
      );
    }

    const requestOrigin = new URL(req.url).origin;
    const referer =
      process.env.OPENROUTER_REFERER ||
      requestOrigin ||
      process.env.NEXT_PUBLIC_APP_URL;

    const prompt = `
You are an expert software code reviewer.

Review the following ${scope === 'selection' ? 'code selection' : 'file'}.

File: ${file}
Language: ${language || 'unknown'}
${range ? `Lines: ${range.startLine}-${range.endLine}` : ''}

Code:
${code}

Return ONLY a valid JSON array like:
[
  {
    "severity": "warning",
    "category": "performance",
    "message": "Short explanation",
    "confidence": "high"
  }
]
`;

    for (const model of MODELS) {
      try {
        const data = await callOpenRouter(model, prompt, apiKey, referer);
        const raw = data.choices?.[0]?.message?.content;

        if (!raw) throw new Error('Empty response');

        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']') + 1;
        const results = JSON.parse(raw.slice(start, end));

        return NextResponse.json({
          success: true,
          modelUsed: model,
          results,
        });
      } catch {
        console.warn(`Model failed: ${model}`);
      }
    }
    return NextResponse.json(
      { error: 'All AI models unavailable' },
      { status: 503 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'AI review failed' },
      { status: 500 }
    );
  }
}
