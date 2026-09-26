import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateSourceCode } from '../server/sourceGenerator';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
}

function parseRequestBody(req: ExtendedRequest): any {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: ExtendedRequest, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  const body = parseRequestBody(req);
  const spec = body?.specification;
  if (!spec || typeof spec !== 'object' || !spec.projectName) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'A valid specification object is required.' }));
    return;
  }

  try {
    const bundle = await generateSourceCode(spec);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ bundle }));
  } catch (error) {
    console.error('Source code generation failed in Vercel function:', error);
    const message = error instanceof Error ? error.message : 'Could not generate source code. Please try again.';
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}
