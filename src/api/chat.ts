import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAgentChat } from '../server/agentChat';

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
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const currentFile = typeof body?.currentFile === 'string' ? body.currentFile : 'VaultCore.sol';
  const currentCode = typeof body?.currentCode === 'string' ? body.currentCode : '';
  const projectContext = body?.projectContext;

  if (!message) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Message cannot be empty.' }));
    return;
  }

  try {
    const response = await handleAgentChat(message, currentFile, currentCode, projectContext);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('Agent chat handler failed in Vercel function:', error);
    const errMessage = error instanceof Error ? error.message : 'Agent encountered an error while processing your request.';
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: errMessage }));
  }
}
