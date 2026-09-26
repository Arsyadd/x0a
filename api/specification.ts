interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const prompt = 'prompt' in body && typeof body.prompt === 'string'
    ? body.prompt.trim()
    : '';

  if (!prompt) {
    res.status(400).json({ error: 'A project prompt is required.' });
    return;
  }
  if (prompt.length > 24000) {
    res.status(413).json({ error: 'The project prompt is too long.' });
    return;
  }

  try {
    const { generateSpecification } = await import('../src/server/specification');
    const specification = await generateSpecification(prompt);
    res.status(200).json({ specification });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'message' in error
    ) {
      res.status(Number(error.statusCode)).json({ error: String(error.message) });
      return;
    }
    console.error('Specification generation failed.');
    res.status(502).json({
      error: 'Could not generate a specification. Please try again.',
    });
  }
}