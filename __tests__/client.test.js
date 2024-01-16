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

describe("MistralClient methods", () => {
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
  });

  describe("listModels()", () => {
    it("should return a list of models", async () => {
      const mockResponse = mockListModels();
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const response = await client.listModels();
      expect(response).toEqual(mockResponse);
    });
  });
});
