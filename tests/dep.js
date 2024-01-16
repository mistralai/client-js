import MistralClient from "../src/client";
import {
  mockListModels,
  mockFetch,
  mockChatResponseStreamingPayload,
  mockEmbeddingRequest,
  mockEmbeddingResponsePayload,
  mockChatResponsePayload,
  mockFetchStream,
} from "./utils";

// Test the list models endpoint
describe("Mistral Client", () => {
  let client;
  beforeEach(() => {
    client = new MistralClient();
  });
});
