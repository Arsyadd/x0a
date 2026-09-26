import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_LINKS = 3;
const MAX_RESPONSE_BYTES = 512 * 1024;
const ALLOWED_CONTENT_TYPES = [
  'text/',
  'application/json',
  'application/xml',
  'application/xhtml+xml',
];

function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) {
    const octets = address.split('.').map(Number);
    const [a, b, c] = octets;
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 0 && c === 2))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113);
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    return normalized === '::' || normalized === '::1' ||
      normalized.startsWith('fc') || normalized.startsWith('fd') ||
      /^fe[89ab]/.test(normalized) || normalized.startsWith('ff') ||
      normalized.startsWith('2001:db8:');
  }
  return true;
}

async function assertPublicHttpUrl(value: string) {
  const url = new URL(value);
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.username || url.password) {
    throw new Error('Only public http/https reference URLs are supported.');
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Private/local reference hosts are not allowed.');
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Reference URL must resolve only to public IP addresses.');
  }
  return url;
}

async function readBoundedText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let content = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('Reference page exceeded the 512 KB limit.');
    }
    content += decoder.decode(value, { stream: true });
  }
  return content + decoder.decode();
}

export async function extractPublicReferenceMaterial(input: unknown) {
  const links = Array.isArray(input)
    ? input.filter((value): value is string => typeof value === 'string').slice(0, MAX_LINKS)
    : [];
  const results: string[] = [];

  for (const link of links) {
    try {
      let currentUrl = link;
      let response: Response | undefined;
      for (let redirect = 0; redirect <= 3; redirect++) {
        const url = await assertPublicHttpUrl(currentUrl);
        response = await fetch(url, {
          redirect: 'manual',
          signal: AbortSignal.timeout(8000),
          headers: { Accept: 'text/html,text/plain,application/json,application/xml' },
        });
        if (response.status < 300 || response.status >= 400) break;
        const location = response.headers.get('location');
        if (!location || redirect === 3) throw new Error('Reference URL has too many redirects.');
        currentUrl = new URL(location, url).toString();
      }

      if (!response?.ok) throw new Error(`Reference page returned HTTP ${response?.status || 'error'}.`);
      const contentType = response.headers.get('content-type') || '';
      if (!ALLOWED_CONTENT_TYPES.some((type) => contentType.includes(type))) {
        throw new Error('Reference must return a text, HTML, XML, or JSON page.');
      }

      let text = await readBoundedText(response);
      if (contentType.includes('html')) {
        text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;|&#160;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/\s+/g, ' ');
      }
      results.push(`Reference URL: ${link}\nExtracted public content:\n${text.slice(0, 20000)}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'could not be read';
      results.push(`Reference URL: ${link}\nContent unavailable: ${reason}. Treat this as an unverified reference, not as extracted requirements.`);
    }
  }

  return results.join('\n\n');
}