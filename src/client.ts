import fetch from "isomorphic-fetch";

const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Client for interacting with the Mistral API
 *
 * @class
 */
export class MistralClient {
  private apiKey: string;
  private config: MistralClientConfig;

  /**
   * Creates an instance of MistralClient.
   *
   * @param {string} [apiKey=process.env.MISTRAL_API_KEY] The API key for accessing the Mistral API. Defaults to the environment variable MISTRAL_API_KEY.
   * @param {string} [endpoint="https://api.mistral.ai"] The endpoint URL of the Mistral API.
   * @param {number} [maxRetries=5] The maximum number of retries for a request in case of failures.
   * @param {number} [timeout=120] The timeout for API requests in seconds.
   * @throws {MistralClientError} Throws an error if the API key is not provided or invalid.
   */
  constructor(
    apiKey: string = process.env.MISTRAL_API_KEY as string,
    endpoint: string = "https://api.mistral.ai",
    maxRetries: number = 5,
    timeout: number = 120
  ) {
    if (!apiKey?.length)
      throw new MistralClientError(
        "MistralClient was not provided a valid API key"
      );

    this.apiKey = apiKey ?? (process.env.MISTRAL_API_KEY as string);
    this.config = { endpoint, maxRetries, timeout };
  }

  private v1 = {
    chat: {
      create: async (params: CreateChat) =>
        this._request("/v1/chat/completions", "POST", params),
      stream: async (params: Omit<CreateChat, "stream">) =>
        this._request("/v1/chat/completions", "POST", {
          ...params,
          stream: true,
        }),
    },
    embeddings: {
      create: async (params: CreateEmbedding) =>
        this._request("/v1/embeddings", "POST", params),
    },
    models: {
      list: async () => this._request("/v1/models", "GET"),
    },
  };

  chat = this.v1.chat.create;
  embeddings = this.v1.embeddings.create;
  listModels = this.v1.models.list;

  public _request = async (path: string, method: HTTPMethod, params?: {}) => {
    for (let attempts = 0; attempts < this.config.maxRetries; attempts++) {
      const res = await this.makeFetchRequest(path, method, params);

      // response is ok always returns
      if (res.ok)
        if (isStreamableType(params) && params?.stream)
          return handleStreamResponse(res);
        else return res.json();

      // response has retry-able error code
      if (RETRY_STATUS_CODES.includes(res.status)) {
        console.warn(
          `Retrying request on response status: ${res.status}`,
          `Response: ${await res.text()}`,
          `Attempt: ${attempts + 1}`
        );

        // exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempts + 1) * 500)
        );

        continue;
      }

      throw new MistralClientError(
        `Unexpected error. Status ${res.status}.\
             Message: ${await res.text()}`
      );
    }

    throw new MistralClientError("Max retries reached");
  };

  private makeFetchRequest = async (
    path: string,
    method: HTTPMethod,
    params?: {}
  ) => {
    const url = `${this.config.endpoint}/${path}`;
    const options = {
      body: JSON.stringify(params),
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method,
      timeout: this.config.timeout * 1000,
    };

    return fetch(url, options);
  };
}

/**
 * Represents an error specific to the Mistral API.
 *
 * @extends Error
 */
export class MistralClientError extends Error {
  public name = "MistralClientError";

  /**
   * Creates a new MistralClientError instance.
   *
   * @param {string} message - The error message that describes the nature of the error.
   */
  constructor(message: string) {
    super(message);
    // Since 'Error' breaks the prototype chain, we restore it here.
    Object.setPrototypeOf(this, MistralClientError.prototype);
  }
}

/****************************************************
 Entities
****************************************************/
type HTTPMethod =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

export interface CreateChat {
  model: string;
  messages: MistralMessage[];

  max_tokens?: number;
  random_seed?: boolean;
  safe_prompt?: boolean;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
}

export interface CreateEmbedding {
  model: string;
  input: string[];
}

export interface ChatCompletionResponseChoice {
  index: number;
  message: { role: string; content: string };
  finish_reason: string;
}

export interface ChatCompletionResponseChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: ChatCompletionResponseChunkChoice[];
}

export interface ChatCompletionResponseChunkChoice {
  index: number;
  delta: { content?: string; role?: string };
  finish_reason: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionResponseChoice[];
  usage: TokenUsage;
}

export interface Embedding {
  id: string;
  object: "embedding";
  embedding: number[];
}

export interface EmbeddingResponse {
  id: string;
  object: "list";
  data: Embedding[];
  model: string;
  usage: TokenUsage;
}

export interface ListModelsResponse {
  object: "list";
  data: Model[];
}

export interface MistralClientConfig {
  endpoint: string;
  maxRetries: number;
  timeout: number;
}

export interface MistralMessage {
  role: "user" | "system";
  content: string;
}

export interface Model {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
  root: string | null;
  parent: string | null;
  permission: ModelPermission[];
}

export interface ModelPermission {
  id: string;
  object: "model_permission";
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: string | null;
  is_blocking: boolean;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/****************************************************
 Utilities
****************************************************/
async function* handleStreamResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader)
    throw new MistralClientError(
      "Unknown error occured and MistralClient was unable to establish stream"
    );
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

function isStreamableType(params: any): params is { stream: true } {
  return params !== undefined && "stream" in params;
}