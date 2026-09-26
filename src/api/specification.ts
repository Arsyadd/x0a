import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateSpecification, SpecificationGenerationError } from '../server/specification';

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
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  const projectName = typeof body?.projectName === 'string' ? body.projectName.trim() : undefined;
  const targetNetwork = typeof body?.targetNetwork === 'string' ? body.targetNetwork.trim() : undefined;

  if (!prompt) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'A project prompt is required.' }));
    return;
  }

  if (prompt.length > 24000) {
    res.statusCode = 413;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'The project prompt is too long.' }));
    return;
  }

  try {
    const specification = await generateSpecification(prompt, { projectName, targetNetwork });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ specification }));
  } catch (error) {
    console.error('Specification generation failed in Vercel function:', error);
    if (error instanceof SpecificationGenerationError) {
      res.statusCode = error.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error.message }));
      return;
    }

    const message = error instanceof Error ? error.message : 'Could not generate a specification. Please try again.';
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}
