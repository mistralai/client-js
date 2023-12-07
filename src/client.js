import axios from 'axios';
import axiosRetry from 'axios-retry';

const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
const ENDPOINT = 'http://api.mistral.ai';

/**
 * MistralClient
 * @return {MistralClient}
 */
class MistralClient {
  /**
   *
   * @param {*} apiKey
   * @param {*} endpoint
   */
  constructor(apiKey, endpoint = ENDPOINT) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.textDecoder = new TextDecoder();

    axiosRetry(axios, {
      retries: 3,
      retryCondition: (error) => {
        return RETRY_STATUS_CODES.includes(error.response.status);
      },

      retryDelay: (retryCount, error) => {
        console.debug(`retry attempt: ${retryCount}`, error);
        return retryCount * 500;
      },
    });
  }

  /**
   *
   * @param {*} method
   * @param {*} path
   * @param {*} request
   * @return {Promise<*>}
   */
  _request = async function(method, path, request) {
    const response = await axios({
      method: method,
      url: `${this.endpoint}/${path}`,
      data: request,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      responseType: request?.stream ? 'stream' : 'json',
    }).catch((error) => {
      console.error(error);
      return error.response;
    });
    return response.data;
  };

  /**
   * Creates a chat completion request
   * @param {*} model
   * @param {*} messages
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} stream
   * @param {*} safeMode
   * @return {Promise<Object>}
   */
  _makeChatCompletionRequest = function(
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    stream,
    safeMode,
  ) {
    return {
      model: model,
      messages: messages,
      temperature: temperature ?? undefined,
      maxTokens: maxTokens ?? undefined,
      topP: topP ?? undefined,
      randomSeed: randomSeed ?? undefined,
      stream: stream ?? undefined,
      safeMode: safeMode ?? undefined,
    };
  };


  listModels = async function() {
    const response = await this._request('get', 'v1/models');
    return response;
  };

  /**
   * Chat
   * @param {*} model
   * @param {*} messages
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} safeMode
   * @return {Promise<Object>}
   */
  chat = async function(
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      false,
      safeMode,
    );
    const response = await this._request(
      'post', 'v1/chat/completions', request,
    );
    return response;
  };

  /**
   * Chat with streaming
   * @param {*} model
   * @param {*} messages
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} safeMode
   * @return {Promise<Object>}
   */
  chatStream = async function* (
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      true,
      safeMode,
    );
    const response = await this._request(
      'post', 'v1/chat/completions', request,
    );

    for await (const chunk of response) {
      const chunkString = this.textDecoder.decode(chunk);
      if (chunkString.startsWith('data:')) {
        const chunkData = chunkString.substring(6).trim();
        if (chunkData !== '[DONE]') {
          yield JSON.parse(chunkData);
        }
      }
    }
  };

  /**
   * Embeddings
   * @param {*} model
   * @param {*} input
   * @return {Promise<Object>}
   */
  embeddings = async function(model, input) {
    const request = {
      model: model,
      input: input,
    };
    const response = await this._request(
      'post', 'v1/embeddings', request,
    );
    return response;
  };
}


export default MistralClient;
