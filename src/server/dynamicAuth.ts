import { createPublicKey, verify as verifySignature } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

type DynamicJwk = { kid?: string; kty?: string; [key: string]: unknown };
type DynamicClaims = { exp?: number; nbf?: number; scopes?: string[] };

let jwksCache: { expiresAt: number; keys: DynamicJwk[] } | null = null;

async function getDynamicKeySet(environmentId: string) {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;

  const response = await fetch(`https://app.dynamic.xyz/api/v0/sdk/${encodeURIComponent(environmentId)}/.well-known/jwks`);
  if (!response.ok) throw new Error('Could not load Dynamic signing keys.');
  const data = await response.json() as { keys?: DynamicJwk[] };
  if (!Array.isArray(data.keys)) throw new Error('Dynamic signing keys are invalid.');

  jwksCache = { keys: data.keys, expiresAt: Date.now() + 10 * 60 * 1000 };
  return data.keys;
}

export async function verifyDynamicAuthToken(token: string, environmentId: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string; kid?: string };
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as DynamicClaims;
    if (!header.kid || !['RS256', 'ES256'].includes(header.alg || '')) return false;
    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.exp !== 'number' || claims.exp <= now) return false;
    if (typeof claims.nbf === 'number' && claims.nbf > now) return false;
    if (Array.isArray(claims.scopes) && claims.scopes.includes('requiresAdditionalAuth')) return false;

    const key = (await getDynamicKeySet(environmentId)).find(candidate => candidate.kid === header.kid);
    if (!key) return false;
    const publicKey = createPublicKey({ key: key as unknown as import('node:crypto').JsonWebKey, format: 'jwk' });
    const signedData = Buffer.from(`${parts[0]}.${parts[1]}`);
    const signature = Buffer.from(parts[2], 'base64url');

    if (header.alg === 'RS256') return verifySignature('RSA-SHA256', signedData, publicKey, signature);
    return verifySignature('sha256', signedData, { key: publicKey, dsaEncoding: 'ieee-p1363' }, signature);
  } catch {
    return false;
  }
}

export async function isDynamicRequestAuthorized(request: IncomingMessage) {
  const environmentId = process.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  const authorization = request.headers.authorization || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  return Boolean(environmentId && token && await verifyDynamicAuthToken(token, environmentId));
}
