const nativeFetch =
  typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function'
    ? globalThis.fetch.bind(globalThis)
    : typeof window !== 'undefined' && typeof window.fetch === 'function'
    ? window.fetch.bind(window)
    : undefined;

const _fetch = nativeFetch || ((...args: any[]) => (fetch as any)(...args));

export default _fetch;
export { _fetch as fetch };
export const Headers =
  typeof globalThis !== 'undefined' && globalThis.Headers
    ? globalThis.Headers
    : typeof window !== 'undefined'
    ? window.Headers
    : undefined;
export const Request =
  typeof globalThis !== 'undefined' && globalThis.Request
    ? globalThis.Request
    : typeof window !== 'undefined'
    ? window.Request
    : undefined;
export const Response =
  typeof globalThis !== 'undefined' && globalThis.Response
    ? globalThis.Response
    : typeof window !== 'undefined'
    ? window.Response
    : undefined;
