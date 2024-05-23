import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

// Assuming we have the following data
const data = {
  transactionId: ['T1001', 'T1002', 'T1003', 'T1004', 'T1005'],
  customerId: ['C001', 'C002', 'C003', 'C002', 'C001'],
  paymentAmount: [125.5, 89.99, 120.0, 54.3, 210.2],
  paymentDate: [
    '2021-10-05',
    '2021-10-06',
    '2021-10-07',
    '2021-10-05',
    '2021-10-08',
  ],
  paymentStatus: ['Paid', 'Unpaid', 'Paid', 'Paid', 'Pending'],
};

/**
 * This function retrieves the payment status of a transaction id.
 * @param {object} data - The data object.
 * @param {string} transactionId - The transaction id.
 * @return {string} - The payment status.
 */
function retrievePaymentStatus({data, transactionId}) {
  const transactionIndex = data.transactionId.indexOf(transactionId);
  if (transactionIndex != -1) {
    return JSON.stringify({status: data.paymentStatus[transactionIndex]});
  } else {
    return JSON.stringify({status: 'error - transaction id not found.'});
  }
}

/**
 * This function retrieves the payment date of a transaction id.
 * @param {object} data - The data object.
 * @param {string} transactionId - The transaction id.
 * @return {string} - The payment date.
 *
 */
function retrievePaymentDate({data, transactionId}) {
  const transactionIndex = data.transactionId.indexOf(transactionId);
  if (transactionIndex != -1) {
    return JSON.stringify({status: data.payment_date[transactionIndex]});
  } else {
    return JSON.stringify({status: 'error - transaction id not found.'});
  }
}

const namesToFunctions = {
  retrievePaymentStatus: (transactionId) =>
    retrievePaymentStatus({data, ...transactionId}),
  retrievePaymentDate: (transactionId) =>
    retrievePaymentDate({data, ...transactionId}),
};

const tools = [
  {
    type: 'function',
    function: {
      name: 'retrievePaymentStatus',
      description: 'Get payment status of a transaction id',
      parameters: {
        type: 'object',
        required: ['transactionId'],
        properties: {
          transactionId: {type: 'string', description: 'The transaction id.'},
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'retrievePaymentDate',
      description: 'Get payment date of a transaction id',
      parameters: {
        type: 'object',
        required: ['transactionId'],
        properties: {
          transactionId: {type: 'string', description: 'The transaction id.'},
        },
      },
    },
  },
];

const model = 'mistral-small-latest';

const client = new MistralClient(apiKey);

const messages = [
  {role: 'user', content: 'What\'s the status of my transaction?'},
];

let response = await client.chat({
  model: model,
  messages: messages,
  tools: tools,
});

console.log(response.choices[0].message.content);

messages.push({
  role: 'assistant',
  content: response.choices[0].message.content,
});
messages.push({role: 'user', content: 'My transaction ID is T1001.'});

response = await client.chat({
  model: model,
  messages: messages,
  tools: tools,
});

const toolCall = response.choices[0].message.tool_calls[0];
const functionName = toolCall.function.name;
const functionParams = JSON.parse(toolCall.function.arguments);

console.log(`calling functionName: ${functionName}`);
console.log(`functionParams: ${toolCall.function.arguments}`);

const functionResult = namesToFunctions[functionName](functionParams);

messages.push(response.choices[0].message);
messages.push({
  role: 'tool',
  name: functionName,
  content: functionResult,
  tool_call_id: toolCall.id,
});

response = await client.chat({
  model: model,
  messages: messages,
  tools: tools,
});

console.log(response.choices[0].message.content);
