const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function* streamTrip(payload: object): AsyncGenerator<any> {
  const res = await fetch(`${BASE}/trip/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;
      try {
        yield JSON.parse(raw);
      } catch {
        // partial chunk — skip
      }
    }
  }
}

export async function adaptTrip(payload: object): Promise<any> {
  const res = await fetch(`${BASE}/trip/adapt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Adapt API error ${res.status}`);
  return res.json();
}
