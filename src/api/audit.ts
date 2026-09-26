import type { IncomingMessage, ServerResponse } from 'node:http';
import { isDynamicRequestAuthorized } from '../server/dynamicAuth';
import { auditCode } from '../server/securityAudit';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
}

async function parseRequestBody(req: ExtendedRequest): Promise<any> {
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
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
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

  if (!(await isDynamicRequestAuthorized(req))) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Please sign in to use this feature.' }));
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  const body = await parseRequestBody(req);
  const files = Array.isArray(body?.files) ? body.files : [];
  const specContext = body?.specification;

  try {
    const auditResult = await auditCode(files, specContext);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(auditResult));
  } catch (error) {
    console.error('Security audit handler failed in Vercel function:', error);
    const errMessage = error instanceof Error ? error.message : 'Security audit agent encountered an error.';
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: errMessage }));
  }
}
