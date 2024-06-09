export const configuredFetch = Promise.resolve(
  globalThis.fetch ?? import('node-fetch').then((m) => m.default),
);
