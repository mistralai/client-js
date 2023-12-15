import axios, { AxiosAdapter } from 'axios'
import axiosRetry from 'axios-retry'
import { createParser } from 'eventsource-parser'

const RETRY_STATUS_CODES = [429, 500, 502, 503, 504]
const ENDPOINT = 'https://api.mistral.ai'

type Role = 'user' | 'system' | 'assistant'
type Model = 'mistral-tiny' | 'mistral-small' | 'mistral-medium' | string

export interface Message {
  role: Role
  content: string
}

export interface CompletionRequestOptions {
  model: string
  messages: Message[]
  temperature?: number
  maxTokens?: number
  topP?: number
  randomSeed?: number
  stream?: boolean
  safeMode?: boolean
}

interface EmbeddingRequest {
  model: string
  input: string[]
}

interface CompletionRequest {
  model: Model
  messages: Message[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  random_seed?: number
  stream?: boolean
  safe_prompt?: boolean
}

type CompletionEvent = {
  choices: Array<{
    delta: {
      content: string
    }
  }>
}

export interface MistralClientOptions {
  adapter?: AxiosAdapter
  endpoint?: string
}

/**
 * MistralClient
 * @return {MistralClient}
 */
class MistralClient {
  endpoint: string
  apiKey: string
  textDecoder: TextDecoder
  options: MistralClientOptions

  /**
   * A simple and lightweight client for the Mistral API
   * @param apiKey can be set as an environment variable MISTRAL_API_KEY,
   * or provided in this parameter
   * @param endpointOrOptions - endpoint as a string, or options
   */
  constructor(
    apiKey = process.env.MISTRAL_API_KEY,
    endpointOrOptions?: string | MistralClientOptions
  ) {
    if (!apiKey) {
      throw new Error(
        'apiKey must be defined. Did you forget to set MISTRAL_API_KEY env?'
      )
    }
    this.apiKey = apiKey
    this.options =
      typeof endpointOrOptions === 'object' ? endpointOrOptions : {}
    this.endpoint =
      typeof endpointOrOptions === 'string'
        ? endpointOrOptions
        : endpointOrOptions?.endpoint ?? ENDPOINT
    this.textDecoder = new TextDecoder()

    axiosRetry(axios, {
      retries: 3,
      retryCondition: error => {
        const status = error.response?.status
        return typeof status === 'number' && RETRY_STATUS_CODES.includes(status)
      },
      retryDelay: (retryCount, error) => {
        console.debug(`retry attempt: ${retryCount}`, error)
        return retryCount * 500
      }
    })
  }

  private async _request(
    method: string,
    path: string,
    data?: object & { stream?: boolean }
  ): Promise<any> {
    const response = await axios({
      method,
      url: `${this.endpoint}/${path}`,
      data: data,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      },
      responseType: data?.stream ? 'stream' : 'json',
      adapter: this.options.adapter
    }).catch(error => {
      console.error(error)
      return error.response
    })
    return response.data
  }

  private _makeChatCompletionRequest(
    model: string,
    messages: Message[],
    temperature?: number,
    maxTokens?: number,
    topP?: number,
    randomSeed?: number,
    stream?: boolean,
    safeMode?: boolean
  ): CompletionRequest {
    return {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      random_seed: randomSeed,
      stream,
      safe_prompt: safeMode
    }
  }

  /**
   * Returns a list of the available models
   */
  public async listModels(): Promise<any> {
    return this._request('get', 'v1/models')
  }

  /**
   * A chat endpoint without streaming
   */
  public async chat({
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode
  }: CompletionRequestOptions): Promise<any> {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      false,
      safeMode
    )
    return this._request('post', 'v1/chat/completions', request)
  }

  /**
   * A chat endpoint with streaming
   */
  public chatStream({
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode
  }: CompletionRequestOptions): AsyncGenerator<CompletionEvent, void> {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      true,
      safeMode
    )
    const responsePromise = this._request(
      'post',
      'v1/chat/completions',
      request
    )

    const decoder = this.textDecoder
    const events = async function* () {
      const chanel: CompletionEvent[] = []
      const parser = createParser(event => {
        if (event.type === 'event' && event.data !== '[DONE]') {
          const obj = JSON.parse(event.data)
          chanel.push(obj)
        }
      })

      for await (const chunk of await responsePromise) {
        parser.feed(decoder.decode(chunk, { stream: true }))
        while (chanel.length > 0) {
          yield chanel.shift()!
        }
      }
    }
    return events()
  }

  public async embeddings({ model, input }: EmbeddingRequest): Promise<any> {
    const request = {
      model,
      input
    }
    return this._request('post', 'v1/embeddings', request)
  }
}

export default MistralClient
