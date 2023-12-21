import MistralClient from '../src/client';
import jest from 'jest-mock';

// Test the list models endpoint
describe('Mistral Client', () => {
  let client;
  beforeEach(() => {
    client = new MistralClient();
  });

  const mockFetch = (status, payload) => {
    return jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(payload),
        text: () => Promise.resolve(JSON.stringify(payload)),
        status,
      }),
    );
  };

  describe('listModels()', () => {
    it('should return a list of models', async() => {
      // Mock the fetch function
      globalThis.fetch = mockFetch(200, {
        models: [
          'mistral-tiny',
          'mistral-small',
          'mistral-large',
          'mistral-mega',
        ],
      });

      const models = await client.listModels();
      expect(models).toEqual({
        models: [
          'mistral-tiny',
          'mistral-small',
          'mistral-large',
          'mistral-mega',
        ],
      });
    });
  });
});
