// test/client.test.ts
import {describe, expect} from '@jest/globals';

import MistralClient from '../src/mistral-client';
import {
  mockListModels,
  mockFetch,
  mockChatResponseStreamingPayload,
  mockEmbeddingRequest,
  mockChatResponsePayload,
  mockFetchStream,
  mockEmbeddingResponsePayload,
} from './test-utils';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatParams {
  model: string;
  messages: ChatMessage[];
  safeMode?: boolean;
  safePrompt?: boolean;
}

interface ChatStreamParams extends ChatParams {
  [key: string]: any;
}

describe('Mistral Client', () => {
  let client: MistralClient;

  beforeEach(() => {
    client = new MistralClient();
  });

  describe('chat()', () => {
    it('should return a chat response object', async() => {
      const mockResponse = mockChatResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.chat({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: 'What is the best French cheese?',
          },
        ],
      });
      expect(response).toEqual(mockResponse);
    });

    it('should return a chat response object if safeMode is set', async() => {
      const mockResponse = mockChatResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.chat({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: 'What is the best French cheese?',
          },
        ],
        safeMode: true,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should return a chat response object if safePrompt is set', async() => {
      const mockResponse = mockChatResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.chat({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: 'What is the best French cheese?',
          },
        ],
        safePrompt: true,
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('chatStream()', () => {
    it('should return parsed, streamed response', async() => {
      const mockResponse = mockChatResponseStreamingPayload();
      client['_fetch'] = mockFetchStream(200, mockResponse) as any;

      const response = await client.chatStream({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: 'What is the best French cheese?',
          },
        ],
      });

      const parsedResponse: any[] = [];
      for await (const r of response) {
        parsedResponse.push(r);
      }

      expect(parsedResponse.length).toEqual(11);
    });

    it('should return parsed, streamed response with safeMode', async() => {
      const mockResponse = mockChatResponseStreamingPayload();
      client['_fetch'] = mockFetchStream(200, mockResponse) as any;

      const response = await client.chatStream({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: 'What is the best French cheese?',
          },
        ],
        safeMode: true,
      });

      const parsedResponse: any[] = [];
      for await (const r of response) {
        parsedResponse.push(r);
      }

      expect(parsedResponse.length).toEqual(11);
    });

    it('should return parsed, streamed response with safePrompt', async() => {
      const mockResponse = mockChatResponseStreamingPayload();
      client['_fetch'] = mockFetchStream(200, mockResponse) as any;

      const response = await client.chatStream({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: 'What is the best French cheese?',
          },
        ],
        safePrompt: true,
      });

      const parsedResponse: any[] = [];
      for await (const r of response) {
        parsedResponse.push(r);
      }

      expect(parsedResponse.length).toEqual(11);
    });
  });

  describe('embeddings()', () => {
    it('should return embeddings', async() => {
      const mockResponse = mockEmbeddingResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.embeddings(mockEmbeddingRequest());
      expect(response).toEqual(mockResponse);
    });
  });

  describe('embeddings() batched', () => {
    it('should return batched embeddings', async() => {
      const mockResponse = mockEmbeddingResponsePayload(10);
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.embeddings(mockEmbeddingRequest());
      expect(response).toEqual(mockResponse);
    });
  });

  describe('listModels()', () => {
    it('should return a list of models', async() => {
      const mockResponse = mockListModels();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.listModels();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('completion()', () => {
    it('should return a chat response object', async() => {
      // Mock the fetch function
      const mockResponse = mockChatResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.completion({
        model: 'mistral-small-latest',
        prompt: '# this is a',
      });
      expect(response).toEqual(mockResponse);
    });
  });
});
