import MistralClient from '../client.js';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new MistralClient(apiKey);

const chatResponse = await client.chat(
    'mistral-tiny',
    [{role: 'user', content: 'What is the best French cheese?'}],
);

console.log('Chat:', chatResponse);
