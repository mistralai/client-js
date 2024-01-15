declare module "@mistralai/mistralai" {
  class MistralClient {
    constructor(apiKey?: string, endpoint?: string);

    private _request(
      method: string,
      path: string,
      request: unknown
    ): Promise<unknown>;

    private _makeChatCompletionRequest(
      model: string,
      messages: Array<{ role: string; content: string }>,
      temperature?: number,
      maxTokens?: number,
      topP?: number,
      randomSeed?: number,
      stream?: boolean,
      /**
       * @deprecated use safePrompt instead
       */
      safeMode?: boolean,
      safePrompt?: boolean
    ): object;

    listModels(): Promise<ListModelsResponse>;

    chat(options: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      randomSeed?: number;
      /**
       * @deprecated use safePrompt instead
       */
      safeMode?: boolean;
      safePrompt?: boolean;
    }): Promise<ChatCompletionResponse>;

    chatStream(options: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      randomSeed?: number;
      /**
       * @deprecated use safePrompt instead
       */
      safeMode?: boolean;
      safePrompt?: boolean;
    }): AsyncGenerator<ChatCompletionResponseChunk, void, unknown>;

    embeddings(options: {
      model: string;
      input: string | string[];
    }): Promise<EmbeddingResponse>;
  }

  export default MistralClient;
}
