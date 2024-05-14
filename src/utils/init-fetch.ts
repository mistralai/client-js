export let isNode = false;

export async function initializeFetch() {
  if (typeof window === 'undefined' || typeof globalThis.fetch === 'undefined') {
    const nodeFetch = await import('node-fetch');
    globalThis.fetch = nodeFetch.default as any;
    isNode = true;
  }
}


export const configuredFetch = Promise.resolve(
  globalThis.fetch ?? import('node-fetch').then((m) => m.default),
);