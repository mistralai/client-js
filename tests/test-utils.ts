import {jest} from '@jest/globals';
import {ChatCompletionResponse, Embedding, EmbeddingResponse, ListModelsResponse} from '../src/types/mistral-client';

interface FetchResponse {
  json: () => Promise<any>;
  text: () => Promise<string>;
  status: number;
  ok: boolean;
}

interface FetchStreamResponse {
  status: number;
  ok: boolean;
  body: AsyncGenerator;
}

export function mockFetch(status: number, payload: any): jest.Mock<() => Promise<FetchResponse>> {
  return jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(payload),
      text: () => Promise.resolve(JSON.stringify(payload)),
      status,
      ok: status >= 200 && status < 300,
    }),
  );
}

export function mockFetchStream(
  status: number,
  payload: any[],
): jest.Mock<() => Promise<FetchStreamResponse>> {
  const asyncIterator = async function* () {
    while (true) {
      const value = payload.shift();
      if (!value) return;
      yield value;
    }
  };

  return jest.fn(() =>
    Promise.resolve({
      // body is a ReadableStream of the objects in payload list
      body: asyncIterator(),
      status,
      ok: status >= 200 && status < 300,
    }),
  );
}

export function mockListModels(): ListModelsResponse {
  return {
    object: 'list',
    data: [
      {
        id: 'mistral-medium',
        object: 'model',
        created: 1703186988,
        owned_by: 'mistralai',
        root: null,
        parent: null,
        permission: [
          {
            id: 'modelperm-15bebaf316264adb84b891bf06a84933',
            object: 'model_permission',
            created: 1703186988,
            allow_create_engine: false,
            allow_sampling: true,
            allow_logprobs: false,
            allow_search_indices: false,
            allow_view: true,
            allow_fine_tuning: false,
            organization: '*',
            group: null,
            is_blocking: false,
          },
        ],
      },
      {
        id: 'mistral-small-latest',
        object: 'model',
        created: 1703186988,
        owned_by: 'mistralai',
        root: null,
        parent: null,
        permission: [
          {
            id: 'modelperm-d0dced5c703242fa862f4ca3f241c00e',
            object: 'model_permission',
            created: 1703186988,
            allow_create_engine: false,
            allow_sampling: true,
            allow_logprobs: false,
            allow_search_indices: false,
            allow_view: true,
            allow_fine_tuning: false,
            organization: '*',
            group: null,
            is_blocking: false,
          },
        ],
      },
      {
        id: 'mistral-tiny',
        object: 'model',
        created: 1703186988,
        owned_by: 'mistralai',
        root: null,
        parent: null,
        permission: [
          {
            id: 'modelperm-0e64e727c3a94f17b29f8895d4be2910',
            object: 'model_permission',
            created: 1703186988,
            allow_create_engine: false,
            allow_sampling: true,
            allow_logprobs: false,
            allow_search_indices: false,
            allow_view: true,
            allow_fine_tuning: false,
            organization: '*',
            group: null,
            is_blocking: false,
          },
        ],
      },
      {
        id: 'mistral-embed',
        object: 'model',
        created: 1703186988,
        owned_by: 'mistralai',
        root: null,
        parent: null,
        permission: [
          {
            id: 'modelperm-ebdff9046f524e628059447b5932e3ad',
            object: 'model_permission',
            created: 1703186988,
            allow_create_engine: false,
            allow_sampling: true,
            allow_logprobs: false,
            allow_search_indices: false,
            allow_view: true,
            allow_fine_tuning: false,
            organization: '*',
            group: null,
            is_blocking: false,
          },
        ],
      },
    ],
  };
}

export function mockChatResponsePayload(): ChatCompletionResponse {
  return {
    id: 'chat-98c8c60e3fbf4fc49658eddaf447357c',
    object: 'chat.completion',
    created: 1703165682,
    choices: [
      {
        finish_reason: 'stop',
        message: {
          role: 'assistant',
          content: 'What is the best French cheese?',
        },
        index: 0,
      },
    ],
    model: 'mistral-small-latest',
    usage: {prompt_tokens: 90, total_tokens: 90, completion_tokens: 0},
  };
}

export function mockChatResponseStreamingPayload(): Uint8Array[] {
  const encoder = new TextEncoder();

  // Initial message
  const firstMessage: Uint8Array[] = [
    encoder.encode(
      'data: ' +
        JSON.stringify({
          id: 'cmpl-8cd9019d21ba490aa6b9740f5d0a883e',
          model: 'mistral-small-latest',
          choices: [
            {
              index: 0,
              delta: {role: 'assistant'},
              finish_reason: null,
            },
          ],
        }) +
        '\n\n',
    ),
  ];

  // Final message
  const lastMessage: Uint8Array[] = [encoder.encode('data: [DONE]\n\n')];

  // Streamed data messages
  const dataMessages: Uint8Array[] = [];
  for (let i = 0; i < 10; i++) {
    dataMessages.push(
      encoder.encode(
        'data: ' +
          JSON.stringify({
            id: 'cmpl-8cd9019d21ba490aa6b9740f5d0a883e',
            object: 'chat.completion.chunk',
            created: 1703168544,

            model: 'mistral-small-latest',
            choices: [
              {
                index: i,
                delta: {content: `stream response ${i}`},
                finish_reason: null,
              },
            ],
          }) +
          '\n\n',
      ),
    );
  }

  // Combine first, data, and last messages
  return firstMessage.concat(dataMessages).concat(lastMessage);
}

/**
 * Mock embeddings response
 * @param batchSize number of embeddings to generate
 * @return EmbeddingResponsePayload
 */
export function mockEmbeddingResponsePayload(batchSize: number = 1): EmbeddingResponse {
  const data: Embedding[] = [];

  // Create 'batchSize' copies of the embedding object
  for (let i = 0; i < batchSize; i++) {
    data.push({
      id: i.toString(),
      object: 'embedding',
      embedding: [-0.018585205078125, 0.027099609375, 0.02587890625],
    });
  }

  return {
    id: 'embd-98c8c60e3fbf4fc49658eddaf447357c',
    object: 'list',
    data: data,
    model: 'mistral-embed',
    usage: {prompt_tokens: 90, total_tokens: 90, completion_tokens: 0},
  };
}

// TODO:
export function mockEmbeddingRequest(): any {
  return {
    model: 'mistral-embed',
    input: 'embed',
  };
}

/**
 * Mock file response payload
 * @return {Object}
 */
export function mockFileResponsePayload() {
  return {
    id: 'fileId',
    object: 'file',
    bytes: 0,
    created_at: 1633046400000,
    filename: 'file.jsonl',
    purpose: 'fine-tune',
  };
}

/**
 * Mock files response payload
 * @return {Object}
 */
export function mockFilesResponsePayload() {
  return {
    data: [
      {
        id: 'fileId',
        object: 'file',
        bytes: 0,
        created_at: 1633046400000,
        filename: 'file.jsonl',
        purpose: 'fine-tune',
      },
    ],
    object: 'list',
  };
}

/**
 * Mock deleted file response payload
 * @return {Object}
 */
export function mockDeletedFileResponsePayload() {
  return {
    id: 'fileId',
    object: 'file',
    deleted: true,
  };
}

/**
 * Mock job response payload
 * @return {Object}
 */
export function mockJobResponsePayload() {
  return {
    id: 'jobId',
    hyperparameters: {
      training_steps: 1800,
      learning_rate: 1.0e-4,
    },
    fine_tuned_model: 'fine_tuned_model_id',
    model: 'mistral-medium',
    status: 'QUEUED',
    job_type: 'fine_tuning',
    created_at: 1633046400000,
    modified_at: 1633046400000,
    training_files: ['file1.jsonl', 'file2.jsonl'],
    validation_files: ['file3.jsonl', 'file4.jsonl'],
    object: 'job',
  };
}

/**
 * Mock jobs response payload
 * @return {Object}
 */
export function mockJobsResponsePayload() {
  return {
    data: [
      {
        id: 'jobId1',
        hyperparameters: {
          training_steps: 1800,
          learning_rate: 1.0e-4,
        },
        fine_tuned_model: 'fine_tuned_model_id1',
        model: 'mistral-medium',
        status: 'QUEUED',
        job_type: 'fine_tuning',
        created_at: 1633046400000,
        modified_at: 1633046400000,
        training_files: ['file1.jsonl', 'file2.jsonl'],
        validation_files: ['file3.jsonl', 'file4.jsonl'],
        object: 'job',
      },
      {
        id: 'jobId2',
        hyperparameters: {
          training_steps: 1800,
          learning_rate: 1.0e-4,
        },
        fine_tuned_model: 'fine_tuned_model_id2',
        model: 'mistral-medium',
        status: 'RUNNING',
        job_type: 'fine_tuning',
        created_at: 1633046400000,
        modified_at: 1633046400000,
        training_files: ['file5.jsonl', 'file6.jsonl'],
        validation_files: ['file7.jsonl', 'file8.jsonl'],
        object: 'job',
      },
    ],
    object: 'list',
  };
}

/**
 * Mock deleted job response payload
 * @return {Object}
 */
export function mockDeletedJobResponsePayload() {
  return {
    id: 'jobId',
    object: 'job',
    deleted: true,
  };
}
