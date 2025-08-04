import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { links } = await req.json();

  const prompt = `
Za vsak spodnji link (z opisom in tagi) določi, v katero tematsko skupino spada. Vrni JSON array, kjer ima vsak link svoj "group_title" (naslov skupine), npr.:
[
  { "url": "...", "group_title": "Programiranje" },
  { "url": "...", "group_title": "Zabava" }
]
Linki:
${links.map((l: any, i: number) => `${i + 1}. ${l.url} (${l.tags}) - ${l.description || ''}`).join('\n')}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
    }),
  });

  const data = await response.json();
  let grouped = [];
  try {
    const match = data.choices?.[0]?.message?.content.match(/\[.*\]/);
    if (match) grouped = JSON.parse(match[0]);
  } catch (e) {}
  return NextResponse.json({ grouped });
}