import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    const system = 'You are an assistant that writes a very short, concise description (max 25 words) of a given website in English. Return only the description, no extra formatting.'
    const user = `Write a short English description for this URL: ${url}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 80,
        temperature: 0.5,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'OpenAI error', details: err }, { status: 500 })
    }

    const data = await response.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content
    const description = (content || '').trim().replace(/^"|"$/g, '')
    return NextResponse.json({ description })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal error', details: error?.message }, { status: 500 })
  }
}


