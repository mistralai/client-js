import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new MistralClient(apiKey);

try {
  const chatResponse = await client.chat({
    model: 'mistral-tiny',
    messages: [{role: 'user', content: 'What is the best French cheese?'}],
  });
  console.log('Chat:', chatResponse.choices[0].message.content);
} catch (error) {
  console.log(error);
}
