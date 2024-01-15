import fetch from "isomorphic-fetch";

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

  public executeRequest = async (
    path: string,
    method: HTTPMethod,
    params?: {}
  ) => {
    for (let attempts = 0; attempts < this.config.maxRetries; attempts++) {
      const res = await this.makeFetchRequest(path, method, params);

      // response is ok always returns
      if (res.ok)
        if (isStreamableType(params) && params?.stream)
          return handleStreamResponse(res);
        else return res.json();
    }
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

interface MistralClientConfig {
  endpoint: string;
  maxRetries: number;
  timeout: number;
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
