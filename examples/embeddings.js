import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new MistralClient(apiKey);

const input = [];
for (let i = 0; i < 10; i++) {
    input.push('What is the best French cheese?');
}

const embeddingsBatchResponse = await client.embeddings('mistral-embed', input);

console.log('Embeddings Batch:', embeddingsBatchResponse.data);
