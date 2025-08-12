import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { links } = await req.json();

  const prompt = `
For each link below (with optional description and tags), assign a concise thematic group title in English. Return a JSON array with entries in the form:
[
  { "url": "...", "group_title": "Programming" },
  { "url": "...", "group_title": "Entertainment" }
]
Links:
${links.map((l: any, i: number) => `${i + 1}. ${l.url} (${l.tags || ''}) - ${l.description || ''}`).join('\n')}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond strictly in English. Return only a valid JSON array as specified.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  let grouped = [];
  try {
    const match = data.choices?.[0]?.message?.content.match(/\[[\s\S]*\]/);
    if (match) grouped = JSON.parse(match[0]);
  } catch (e) {}
  return NextResponse.json({ grouped });
}