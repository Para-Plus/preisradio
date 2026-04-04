import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MCP_URL = 'https://api.preisradio.de/mcp/';

const tools = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Suche nach Produkten auf preisradio.de across Saturn, MediaMarkt, Otto, Kaufland',
      parameters: {
        type: 'object',
        properties: {
          query:    { type: 'string',  description: 'Suchbegriff (Produktname, Marke, Modell)' },
          category: { type: 'string',  description: 'Kategorie Filter (optional)' },
          brand:    { type: 'string',  description: 'Marke Filter (optional)' },
          limit:    { type: 'integer', description: 'Anzahl Ergebnisse 1-12 (Standard 8)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_prices',
      description: 'Preisvergleich für ein Produkt anhand EAN/GTIN Barcode über alle Händler',
      parameters: {
        type: 'object',
        properties: {
          gtin: { type: 'string', description: 'EAN/GTIN Barcode z.B. 4549576231501' },
        },
        required: ['gtin'],
      },
    },
  },
];

async function callMcp(toolName: string, args: Record<string, unknown>) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });
  const data = await res.json();
  const text = data?.result?.content?.[0]?.text;
  return text ? JSON.parse(text) : [];
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  const { query } = await request.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }

  const messages: object[] = [
    {
      role: 'system',
      content: `Du bist ein hilfreicher Preisvergleich-Assistent für preisradio.de.
Nutze search_products um Produkte zu finden. Antworte kurz auf Deutsch (2-3 Sätze max).
Nenne die günstigsten Optionen mit Preisen. Verwende keine Markdown-Listen.`,
    },
    { role: 'user', content: query },
  ];

  // First call — let Groq decide which tool to use
  const firstRes = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 400,
    }),
  });

  const firstData = await firstRes.json();
  const assistantMsg = firstData.choices?.[0]?.message;
  if (!assistantMsg) {
    return NextResponse.json({ error: 'Groq error' }, { status: 500 });
  }

  let products: object[] = [];

  if (assistantMsg.tool_calls?.length) {
    messages.push(assistantMsg);

    for (const tc of assistantMsg.tool_calls) {
      const args = JSON.parse(tc.function.arguments || '{}');
      const result = await callMcp(tc.function.name, { ...args, limit: args.limit || 8 });
      products = result;

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(
          result.slice(0, 8).map((p: Record<string, unknown>) => ({
            title: p.title,
            price: p.price,
            old_price: p.old_price,
            retailer: p.retailer,
          }))
        ),
      });
    }

    // Second call — Groq formats the answer
    const secondRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 300,
      }),
    });

    const secondData = await secondRes.json();
    const text = secondData.choices?.[0]?.message?.content || '';
    return NextResponse.json({ text, products });
  }

  // No tool call — direct answer
  return NextResponse.json({ text: assistantMsg.content || '', products: [] });
}
