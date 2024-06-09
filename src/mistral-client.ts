
import {MistralAPIError} from './utils/api-error';
import {configuredFetch} from './utils/init-fetch';
import {combineSignals} from './utils/helper';
import FilesClient from './files';
import JobsClient from './jobs';
import {ChatCompletionResponse, ChatCompletionResponseChunk, ChatRequest, ChatRequestOptions, CompletionRequest, EmbeddingResponse, ListModelsResponse, Message, ResponseFormat, Tool} from './types/mistral-client';

const VERSION = '0.5.0';
const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
const ENDPOINT = 'https://api.mistral.ai';

/**
 * MistralClient
 * @return {MistralClient}
 */
export default class MistralClient {
  public apiKey: string;
  public endpoint: string;
  public maxRetries: number;
  public timeout: number;
  public modelDefault?: string;
  public files:FilesClient;
  public jobs:JobsClient;

  constructor(apiKey = process.env.MISTRAL_API_KEY!, endpoint = ENDPOINT, maxRetries = 5, timeout = 120) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.maxRetries = maxRetries;
    this.timeout = timeout;
    if (this.endpoint.includes('inference.azure.com')) {
      this.modelDefault = 'mistral';
    }

    this.files = new FilesClient(this);
    this.jobs = new JobsClient(this);
  }

  /**
   * hook point for non-global fetch override
   * @param input
   * @param init
   * @returnss
   */
  private async _fetch(input: string | Request, init?: RequestInit) {
    const fetchFunc = await configuredFetch;
    return fetchFunc(input, init);
  }


  /**
   *
   * @param {*} method
   * @param {*} path
   * @param {*} request
   * @param {*} signal
   * @param {*} formData
   * @return {Promise<*>}
   */
  async _request(method: string, path: string, request?: any, signal?:AbortSignal, formData?:FormData): Promise<any> {
    const url = `${this.endpoint}/${path}`;
    const headers: Record<string, string> = {
      'User-Agent': `mistral-client-js/${VERSION}`,
      'Accept': request?.stream ? 'text/event-stream' : 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    const options: RequestInit = {
      method,
      headers,
      body: method !== 'get' ? formData ?? JSON.stringify(request) : null,
      signal: signal? combineSignals([AbortSignal.timeout(this.timeout * 1000), signal]): AbortSignal.timeout(this.timeout * 1000),

      // 'timeout' is not a valid option for RequestInit
      // timeout: this.timeout * 1000,
    };

    if (formData) {
      delete headers['Content-Type'];
    }

    for (let attempts = 0; attempts < this.maxRetries; attempts++) {
      try {
        const response = await this._fetch(url, options);
        if (response.ok) {
          if (request?.stream) {
            // When using node-fetch or test mocks, getReader is not defined
            if (typeof response.body!.getReader === 'undefined') {
              return response.body;
            } else {
              const reader = response.body!.getReader();
              // Chrome does not support async iterators yet, so polyfill it
              const asyncIterator = async function* () {
                try {
                  while (true) {
                    // Read from the stream
                    const {done, value} = await reader.read();
                    // Exit if we're done
                    if (done) return;
                    // Else yield the chunk
                    yield value;
                  }
                } finally {
                  reader.releaseLock();
                }
              };

              return asyncIterator();
            }
          }
          return await response.json();
        } else if (RETRY_STATUS_CODES.includes(response.status)) {
          console.debug(
            `Retrying request on response status: ${response.status}`,
            `Response: ${await response.text()}`,
            `Attempt: ${attempts + 1}`,
          );
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts + 1) * 500));
        } else {
          throw new MistralAPIError(
            `HTTP error! status: ${response.status} ` +
            `Response: \n${await response.text()}`,
          );
        }
      } catch (error: any) {
        console.error(`Request failed: ${error.message}`);
        if (attempts === this.maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts + 1) * 500));
      }
    }
    throw new Error('Max retries reached');
  }

  /**
   * Creates a completion request
   * @param {*} model
   * @param {*} prompt
   * @param {*} suffix
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} stop
   * @param {*} stream
   * @return {Promise<Object>}
   */
  _makeCompletionRequest = (
    model: string,
    prompt: string,
    suffix?: string,
    temperature?: number,
    maxTokens?: number,
    topP?: number,
    randomSeed?: number,
    stop?: string | string[],
    stream?: boolean,
  )=>{
    // if modelDefault and model are undefined, throw an error
    if (!model && !this.modelDefault) {
      throw new MistralAPIError('You must provide a model name');
    }
    return {
      model: model ?? this.modelDefault,
      prompt: prompt,
      suffix: suffix ?? undefined,
      temperature: temperature ?? undefined,
      max_tokens: maxTokens ?? undefined,
      top_p: topP ?? undefined,
      random_seed: randomSeed ?? undefined,
      stop: stop ?? undefined,
      stream: stream ?? undefined,
    };
  };

  /**
   * Creates a chat completion request
   * @param {*} model
   * @param {*} messages
   * @param {*} tools
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} stream
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt
   * @param {*} toolChoice
   * @param {*} responseFormat
   * @return {Promise<Object>}
   */
  _makeChatCompletionRequest = (
    model: string,
    messages: Array<Message>,
    tools?: Array<Tool>,
    temperature?: number,
    maxTokens?: number,
    topP?: number,
    randomSeed?: number,
    stream?: boolean,
    safeMode?: boolean,
    safePrompt?: boolean,
    toolChoice?: 'auto' | 'any' | 'none',
    responseFormat?: ResponseFormat,
  )=> {
    // if modelDefault and model are undefined, throw an error
    if (!model && !this.modelDefault) {
      throw new MistralAPIError('You must provide a model name');
    }
    return {
      model: model ?? this.modelDefault,
      messages: messages,
      tools: tools ?? undefined,
      temperature: temperature ?? undefined,
      max_tokens: maxTokens ?? undefined,
      top_p: topP ?? undefined,
      random_seed: randomSeed ?? undefined,
      stream: stream ?? undefined,
      safe_prompt: (safeMode || safePrompt) ?? undefined,
      tool_choice: toolChoice ?? undefined,
      response_format: responseFormat ?? undefined,
    };
  };

  /**
   * Returns a list of the available models
   * @returnss
   */
  async listModels(): Promise<ListModelsResponse> {
    return await this._request('get', 'v1/models');
  }

  /**
   * A chat endpoint without streaming.
   *
   * @param {Object} data - The main chat configuration.
   * @param {*} data.model - the name of the model to chat with,
   *                         e.g. mistral-tiny
   * @param {*} data.messages - an array of messages to chat with, e.g.
   *                            [{role: 'user', content: 'What is the best
   *                            French cheese?'}]
   * @param {*} data.tools - a list of tools to use.
   * @param {*} data.temperature - the temperature to use for sampling, e.g. 0.5
   * @param {*} data.maxTokens - the maximum number of tokens to generate,
   *                             e.g. 100
   * @param {*} data.topP - the cumulative probability of tokens to generate,
   *                        e.g. 0.9
   * @param {*} data.randomSeed - the random seed to use for sampling, e.g. 42
   * @param {*} data.safeMode - deprecated use safePrompt instead
   * @param {*} data.safePrompt - whether to use safe mode, e.g. true
   * @param {*} data.toolChoice - the tool to use, e.g. 'auto'
   * @param {*} data.responseFormat - the format of the response,
   *                                  e.g. 'json_format'
   * @param {Object} options - Additional operational options.
   * @param {*} [options.signal] - optional AbortSignal instance to control
   *                               request The signal will be combined with
   *                               default timeout signal
   * @return {Promise<ChatCompletionResponse>}
   */
  async chat({
    model,
    messages,
    tools,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode,
    safePrompt,
    toolChoice,
    responseFormat,
  }: ChatRequest, {signal}: ChatRequestOptions = {}): Promise<ChatCompletionResponse> {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      tools,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      false,
      safeMode,
      safePrompt,
      toolChoice,
      responseFormat,
    );
    return await this._request('post', 'v1/chat/completions', request, signal);
  }

  /**
   * A chat endpoint that streams responses.
   *
   * @param {Object} data - The main chat configuration.
   * @param {*} data.model - the name of the model to chat with,
   *                         e.g. mistral-tiny
   * @param {*} data.messages - an array of messages to chat with, e.g.
   *                            [{role: 'user', content: 'What is the best
   *                            French cheese?'}]
   * @param {*} data.tools - a list of tools to use.
   * @param {*} data.temperature - the temperature to use for sampling, e.g. 0.5
   * @param {*} data.maxTokens - the maximum number of tokens to generate,
   *                             e.g. 100
   * @param {*} data.topP - the cumulative probability of tokens to generate,
   *                        e.g. 0.9
   * @param {*} data.randomSeed - the random seed to use for sampling, e.g. 42
   * @param {*} data.safeMode - deprecated use safePrompt instead
   * @param {*} data.safePrompt - whether to use safe mode, e.g. true
   * @param {*} data.toolChoice - the tool to use, e.g. 'auto'
   * @param {*} data.responseFormat - the format of the response,
   *                                  e.g. 'json_format'
   * @param {Object} options - Additional operational options.
   * @param {*} [options.signal] - optional AbortSignal instance to control
   *                               request The signal will be combined with
   *                               default timeout signal
   * @return {AsyncGenerator<ChatCompletionResponseChunk, void>}
   */
  async* chatStream({
    model,
    messages,
    tools,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode,
    safePrompt,
    toolChoice,
    responseFormat,
  }: ChatRequest, {signal}: ChatRequestOptions = {}): AsyncGenerator<ChatCompletionResponseChunk, void> {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      tools,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      true,
      safeMode,
      safePrompt,
      toolChoice,
      responseFormat,
    );
    const response = await this._request('post', 'v1/chat/completions', request, signal);
    let buffer = '';
    const decoder = new TextDecoder();
    for await (const chunk of response) {
      buffer += decoder.decode(chunk, {stream: true});
      let firstNewline;
      while ((firstNewline = buffer.indexOf('\n')) !== -1) {
        const chunkLine = buffer.substring(0, firstNewline);
        buffer = buffer.substring(firstNewline + 1);
        if (chunkLine.startsWith('data:')) {
          const json = chunkLine.substring(6).trim();
          if (json !== '[DONE]') {
            yield JSON.parse(json);
          }
        }
      }
    }
  }

  /**
   * An embeddings endpoint that returns embeddings for a single,
   * or batch of inputs
   * @param {*} model The embedding model to use, e.g. mistral-embed
   * @param {*} input The input to embed, e.g. ['What is the best French cheese?']
   * @return {Promise<EmbeddingResponse>}
   */
  async embeddings({model, input}: { model: string; input: string }):Promise<EmbeddingResponse> {
    const request = {
      model: model,
      input: input,
    };
    const response = await this._request('post', 'v1/embeddings', request);
    return response;
  };

  /**
   * A completion endpoint without streaming.
   *
   * @param {Object} data - The main completion configuration.
   * @param {*} data.model - the name of the model to chat with,
   *                         e.g. mistral-tiny
   * @param {*} data.prompt - the prompt to complete,
   *                       e.g. 'def fibonacci(n: int):'
   * @param {*} data.temperature - the temperature to use for sampling, e.g. 0.5
   * @param {*} data.maxTokens - the maximum number of tokens to generate,
   *                             e.g. 100
   * @param {*} data.topP - the cumulative probability of tokens to generate,
   *                        e.g. 0.9
   * @param {*} data.randomSeed - the random seed to use for sampling, e.g. 42
   * @param {*} data.stop - the stop sequence to use, e.g. ['\n']
   * @param {*} data.suffix - the suffix to append to the prompt,
   *                       e.g. 'n = int(input(\'Enter a number: \'))'
   * @param {Object} options - Additional operational options.
   * @param {*} [options.signal] - optional AbortSignal instance to control
   *                               request The signal will be combined with
   *                               default timeout signal
   * @return {Promise<Object>}
   */
  completion = async(
    {model, prompt, suffix, temperature, maxTokens, topP, randomSeed, stop}: CompletionRequest,
    {signal}:ChatRequestOptions = {},
  ) => {
    const request = this._makeCompletionRequest(
      model,
      prompt,
      suffix,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      stop,
      false,
    );
    const response = await this._request(
      'post',
      'v1/fim/completions',
      request,
      signal,
    );
    return response;
  };

  /**
   * A completion endpoint that streams responses.
   *
   * @param {Object} data - The main completion configuration.
   * @param {*} data.model - the name of the model to chat with,
   *                         e.g. mistral-tiny
   * @param {*} data.prompt - the prompt to complete,
   *                       e.g. 'def fibonacci(n: int):'
   * @param {*} data.temperature - the temperature to use for sampling, e.g. 0.5
   * @param {*} data.maxTokens - the maximum number of tokens to generate,
   *                             e.g. 100
   * @param {*} data.topP - the cumulative probability of tokens to generate,
   *                        e.g. 0.9
   * @param {*} data.randomSeed - the random seed to use for sampling, e.g. 42
   * @param {*} data.stop - the stop sequence to use, e.g. ['\n']
   * @param {*} data.suffix - the suffix to append to the prompt,
   *                       e.g. 'n = int(input(\'Enter a number: \'))'
   * @param {Object} options - Additional operational options.
   * @param {*} [options.signal] - optional AbortSignal instance to control
   *                               request The signal will be combined with
   *                               default timeout signal
   * @return {Promise<Object>}
   */
  async* completionStream(
    {model, prompt, suffix, temperature, maxTokens, topP, randomSeed, stop}: CompletionRequest,
    {signal}: ChatRequestOptions = {},
  ) {
    const request = this._makeCompletionRequest(
      model,
      prompt,
      suffix,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      stop,
      true,
    );
    const response = await this._request(
      'post',
      'v1/fim/completions',
      request,
      signal,
    );

    let buffer = '';
    const decoder = new TextDecoder();
    for await (const chunk of response) {
      buffer += decoder.decode(chunk, {stream: true});
      let firstNewline;
      while ((firstNewline = buffer.indexOf('\n')) !== -1) {
        const chunkLine = buffer.substring(0, firstNewline);
        buffer = buffer.substring(firstNewline + 1);
        if (chunkLine.startsWith('data:')) {
          const json = chunkLine.substring(6).trim();
          if (json !== '[DONE]') {
            yield JSON.parse(json);
          }
        }
      }
    }
  };
}
