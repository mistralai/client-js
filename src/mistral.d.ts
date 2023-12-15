
declare module '@mistralai/mistralai' {
    class MistralClient {
      constructor(apiKey?: string, endpoint?: string)
  
      private _request(method: string, path: string, request: any): Promise<any>
  
      private _makeChatCompletionRequest(
        model: string,
        messages: Array<{ role: string; content: string }>,
        temperature?: number,
        maxTokens?: number,
        topP?: number,
        randomSeed?: number,
        stream?: boolean,
        safeMode?: boolean
      ): object
  
      listModels(): Promise<any>
  
      chat(options: {
        model: string
        messages: Array<{ role: string; content: string }>
        temperature?: number
        maxTokens?: number
        topP?: number
        randomSeed?: number
        safeMode?: boolean
      }): Promise<any>
  
      chatStream(options: {
        model: string
        messages: Array<{ role: string; content: string }>
        temperature?: number
        maxTokens?: number
        topP?: number
        randomSeed?: number
        safeMode?: boolean
      }): AsyncGenerator<any, void, unknown>
  
      embeddings(options: {
        model: string
        input: string | string[]
      }): Promise<any>
    }
  
    export default MistralClient
  }