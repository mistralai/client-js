import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new MistralClient(apiKey);

const chatStreamResponse = await client.chatStream({
  model: 'mistral-medium',
  messages: [{role: 'user', content: 'What is the best French cheese?'}],
});

for await (const chunk of chatStreamResponse) {
  console.log('Chat Stream:', JSON.stringify(chunk));
}
