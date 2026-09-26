import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'ok',
    service: 'x0a-api',
    endpoints: [
      '/api/specification',
      '/api/generate-source',
      '/api/agent/chat',
      '/api/agent/audit'
    ]
  }));
}
