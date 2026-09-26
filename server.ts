import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  generateSpecification,
  SpecificationGenerationError,
} from './src/server/specification';
import { generateSourceCode } from './src/server/sourceGenerator';
import { handleAgentChat } from './src/server/agentChat';
import { auditCode } from './src/server/securityAudit';

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '64kb' }));

app.post('/api/specification', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) {
    res.status(400).json({ error: 'A project prompt is required.' });
    return;
  }
  if (prompt.length > 24000) {
    res.status(413).json({ error: 'The project prompt is too long.' });
    return;
  }

  try {
    const specification = await generateSpecification(prompt);
    res.json({ specification });
  } catch (error) {
    if (error instanceof SpecificationGenerationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Specification generation failed:', error);
    res.status(502).json({ error: 'Could not generate a specification. Please try again.' });
  }
});

app.post('/api/generate-source', async (req, res) => {
  const spec = req.body?.specification;
  if (!spec || typeof spec !== 'object' || !spec.projectName) {
    res.status(400).json({ error: 'A valid specification object is required.' });
    return;
  }

  try {
    const bundle = await generateSourceCode(spec);
    res.json({ bundle });
  } catch (error) {
    console.error('Source code generation failed:', error);
    res.status(502).json({ error: 'Could not generate source code. Please try again.' });
  }
});

app.post('/api/agent/chat', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const currentFile = typeof req.body?.currentFile === 'string' ? req.body.currentFile : 'VaultCore.sol';
  const currentCode = typeof req.body?.currentCode === 'string' ? req.body.currentCode : '';
  const projectContext = req.body?.projectContext;

  if (!message) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  try {
    const response = await handleAgentChat(message, currentFile, currentCode, projectContext);
    res.json(response);
  } catch (error) {
    console.error('Agent chat handler failed:', error);
    res.status(502).json({ error: 'Agent encountered an error while processing your request.' });
  }
});

app.post('/api/agent/audit', async (req, res) => {
  const files = Array.isArray(req.body?.files) ? req.body.files : [];
  const specContext = req.body?.specification;

  try {
    const auditResult = await auditCode(files, specContext);
    res.json(auditResult);
  } catch (error) {
    console.error('Security audit handler failed:', error);
    res.status(502).json({ error: 'Security audit agent encountered an error.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (_req, res) => res.sendFile('index.html', { root: 'dist' }));
} else {
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: isHmrDisabled ? false : { server },
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => {
  console.log(`x0a running at http://0.0.0.0:${port}`);
});
