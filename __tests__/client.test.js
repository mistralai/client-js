import MistralClient from "../dist/client.module.js";
import fetchMock from "jest-fetch-mock";
import {
  mockListModels,
  mockFetch,
  mockChatResponseStreamingPayload,
  mockEmbeddingRequest,
  mockEmbeddingResponsePayload,
  mockChatResponsePayload,
  mockFetchStream,
} from "./utils.js";
import jest from "jest-mock";

beforeEach(() => {
  fetch.resetMocks();
});

describe("MistralClient Constructor", () => {
  it("should initialize with default values if no arguments are provided", () => {
    process.env.MISTRAL_API_KEY = "default-api-key";

    const defaultApiKey = process.env.MISTRAL_API_KEY;
    const client = new MistralClient();

    expect(client).toHaveProperty("apiKey", defaultApiKey);
    expect(client).toHaveProperty("config.endpoint", "https://api.mistral.ai");
    expect(client).toHaveProperty("config.maxRetries", 5);
    expect(client).toHaveProperty("config.timeout", 120);
  });

  it("should correctly initialize with custom values", () => {
    const customApiKey = "custom-api-key";
    const customEndpoint = "https://custom.endpoint";
    const customMaxRetries = 3;
    const customTimeout = 60;

    const client = new MistralClient(
      customApiKey,
      customEndpoint,
      customMaxRetries,
      customTimeout
    );

    expect(client).toHaveProperty("apiKey", customApiKey);
    expect(client).toHaveProperty("config.endpoint", customEndpoint);
    expect(client).toHaveProperty("config.maxRetries", customMaxRetries);
    expect(client).toHaveProperty("config.timeout", customTimeout);
  });

  it("should throw an error if no API key is provided", () => {
    expect(() => {
      process.env.MISTRAL_API_KEY = undefined;
      new MistralClient("");
    }).toThrow("MistralClient was not provided a valid API key");
  });
});

describe("MistralClient Methods", () => {
  let client;
  beforeEach(() => {
    const mockApiKey = "test-api-key";
    const mockEndpoint = "https://mock.api";

    fetchMock.resetMocks();
    client = new MistralClient(mockApiKey, mockEndpoint);
  });

  describe("chat()", () => {
    it("should return a chat response object", async () => {
      const mockResponse = mockChatResponsePayload();
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.chat({
        model: "mistral-small",
        messages: [
          { role: "user", content: "What is the best French cheese?" },
        ],
      });

      expect(response).toEqual(mockResponse);
    });

    it("should return a chat response object if safeMode is set", async () => {
      const mockResponse = mockChatResponsePayload();
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.chat({
        model: "mistral-small",
        messages: [
          { role: "user", content: "What is the best French cheese?" },
        ],
        safeMode: true,
      });

      expect(response).toEqual(mockResponse);
    });

    it("should return a chat response object if safePrompt is set", async () => {
      const mockResponse = mockChatResponsePayload();
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.chat({
        model: "mistral-small",
        messages: [
          { role: "user", content: "What is the best French cheese?" },
        ],
        safePrompt: true,
      });

      expect(response).toEqual(mockResponse);
    });
  });

  describe("embeddings()", () => {
    it("should return embeddings", async () => {
      const mockResponse = mockEmbeddingResponsePayload();
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.embeddings(mockEmbeddingRequest);
      expect(response).toEqual(mockResponse);
    });
  });

  describe("embeddings() batched", () => {
    it("should return batched embeddings", async () => {
      const mockResponse = mockEmbeddingResponsePayload(10);
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.embeddings(mockEmbeddingRequest);
      expect(response).toEqual(mockResponse);
    });
  });

  describe("listModels()", () => {
    it("should return a list of models", async () => {
      const mockResponse = mockListModels();
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.listModels();
      expect(response).toEqual(mockResponse);
    });
  });

  describe("chatStream()", () => {
    const chunkCount = 10;
    jest
      .spyOn(MistralClient.prototype, "handleStreamResponse")
      .mockImplementation(async function* () {
        for (let i = 0; i < chunkCount; i++) yield `chunk${i}`;
      });

    const setupMockStreamResponse = (mockResponse) => {
      fetchMock.mockResponse(async () => {
        const readableStream = new ReadableStream({
          start(controller) {
            for (const chunk of mockResponse) controller.enqueue(chunk);
            controller.close();
          },
        });
        return new Response(readableStream);
      });
    };

    it("should return parsed, streamed response", async () => {
      const mockResponse = mockChatResponseStreamingPayload();
      setupMockStreamResponse(mockResponse);

      const response = await client.chatStream({
        model: "mistral-small",
        messages: [
          { role: "user", content: "What is the best French cheese?" },
        ],
      });

      const parsedResponse = [];
      for await (const r of response) {
        parsedResponse.push(r);
      }

      expect(parsedResponse.length).toEqual(chunkCount);
    });

    it("should return parsed, streamed response with safePrompt", async () => {
      const client = new MistralClient();
      const response = await client.chatStream({
        model: "mistral-small",
        messages: [
          { role: "user", content: "What is the best French cheese?" },
        ],
        safePrompt: true,
      });

      const parsedResponse = [];
      for await (const r of response) parsedResponse.push(r);

      expect(parsedResponse.length).toEqual(chunkCount);
    });
  });
});