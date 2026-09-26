import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json({ limit: '32kb' }));

app.post('/api/specification', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) {
    res.status(400).json({ error: 'A project prompt is required.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Specification generation is not configured. Set GEMINI_API_KEY on the server.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            'Create an implementation-ready software specification using only the project request below. Do not assume it is a blockchain project unless the request says so. Mark unknowns as assumptions instead of inventing facts. Return valid JSON with exactly these fields: projectName, ecosystem, language, framework, contractKind, targetNetworks, complexity, summary, functionalRequirements, securityRequirements, outOfScope, assumptions. The first eight fields must be strings; the last four must be arrays of concise strings. Keep requirements specific to the request.\n\nProject request:\n' + prompt,
          ],
          config: { responseMimeType: 'application/json' },
        });
        break;
      } catch (error) {
        const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
        if ((status !== 429 && status !== 503) || attempt === 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
    }

    if (!response) throw new Error('Gemini did not return a response.');

    const specification = JSON.parse(response.text || '{}');
    const stringFields = ['projectName', 'ecosystem', 'language', 'framework', 'contractKind', 'targetNetworks', 'complexity', 'summary'];
    const listFields = ['functionalRequirements', 'securityRequirements', 'outOfScope', 'assumptions'];
    const validStrings = stringFields.every((field) => typeof specification[field] === 'string');
    const validLists = listFields.every((field) => Array.isArray(specification[field]) && specification[field].every((item: unknown) => typeof item === 'string'));

    if (!validStrings || !validLists) {
      throw new Error('The model returned an incomplete specification.');
    }

    res.json({ specification });
  } catch (error) {
    console.error('Specification generation failed:', error);
    const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
    if (status === 429 || status === 503) {
      res.status(status).json({ error: 'Gemini is temporarily busy. Please retry your prompt in a moment.' });
      return;
    }
    res.status(502).json({ error: 'Could not generate a specification. Please try again.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (_req, res) => res.sendFile('index.html', { root: 'dist' }));
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { port: 3001 } },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`x0a running at http://localhost:${port}`);
});