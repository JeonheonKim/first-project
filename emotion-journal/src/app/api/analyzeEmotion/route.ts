import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // (선택) Vercel Edge 환경에서 빠른 응답을 원할 때

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '다음 일기 내용을 감정적으로 분석해서 emotion(감정: 기쁨, 슬픔, 분노, 불안, 중립 등)과 message(짧은 한글 분석 코멘트)만 JSON으로 반환해.' },
          { role: 'user', content },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    // JSON 파싱 시도
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { emotion: '중립', message: text };
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
} 