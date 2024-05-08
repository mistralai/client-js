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
  safePrompt?: boolean;
  safeMode?: boolean;
  toolChoice?: 'any' | 'auto';
  responseFormat?: string;
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
