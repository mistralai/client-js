export interface Message {
  role: string;
  content: string;
}

export interface Tool {
  name: string;
  description: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  tools?: Tool[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  randomSeed?: number;
  stream?: boolean;

  /**
   * @deprecated use safePrompt instead
   */
  safePrompt?: boolean;
  safeMode?: boolean;
  toolChoice?: 'any' | 'auto' | 'none';
  responseFormat?: ResponseFormat;
}

export interface ResponseFormat {
  type: "json_object";
}


export interface ChatRequestOptions{
  signal?: AbortSignal;
}

export interface MistralChatCompletionRequest {
  model: string;
  messages: Message[];
  tools: Tool[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  random_seed: number;
  stream: boolean;
  safe_prompt: boolean;
  tool_choice: 'any' | 'auto';
  response_format: string;
}

export interface Embedding {
  id: string;
  object: "embedding";
  embedding: number[];
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
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


export interface Model {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
  root: string | null;
  parent: string | null;
  permission: ModelPermission[];
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolCalls {
  id: string;
  function: FunctionCall;
}

export interface ListModelsResponse {
  object: "list";
  data: Model[];
}

export interface ChatCompletionResponseChoice {
  index: number;
  message: {
    role: string;
    content: string;
    tool_calls: null | ToolCalls[];
  };
  finish_reason: string;
}


export interface ChatCompletionResponseChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: ChatCompletionResponseChunkChoice[];
  usage: TokenUsage | null;
}

export interface ChatCompletionResponseChunkChoice {
  index: number;
  delta: {
    role?: string;
    content?: string;
    tool_calls?: ToolCalls[];
  };
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

export interface EmbeddingResponse {
  id: string;
  object: "list";
  data: Embedding[];
  model: string;
  usage: TokenUsage;
}