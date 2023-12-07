import MistralClient from '../client.js';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new MistralClient(apiKey);

// LIST MODELS
const listModelsResponse = await client.listModels();

listModelsResponse.data.forEach((model) => {
  console.log('Model:', model);
});

// CHAT
const chatResponse = await client.chat(
  'le-tiny-v2312',
  [{role: 'user', content: 'hello world'}],
);

console.log('Chat:', chatResponse);

// CHAT STREAM
const chatStreamResponse = await client.chatStream(
  'le-tiny-v2312', [{role: 'user', content: 'hello world'}],
);

for await (const chunk of chatStreamResponse) {
  console.log('Chat Stream:', '' + chunk);
}

// chatStreamResponse.data.on('data', (data) => {
//   console.log('Chat Stream:', '' + data);
// });

// EMBEDDINGS
const embeddingsResponse = await client.embeddings('le-embed', 'hello world');

console.log('Embeddings:', embeddingsResponse.data);


// EMBEDDINGS BATCH

// Create 100 strings to embed
const input = [];
for (let i = 0; i < 10; i++) {
  input.push('hello world');
}

const embeddingsBatchResponse = await client.embeddings('le-embed', input);

console.log('Embeddings Batch:', embeddingsBatchResponse.data);
