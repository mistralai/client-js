# Mistral Javascript Client

You can use the Mistral Javascript client to interact with the Mistral AI API

## Installing

You can install the library in your project using:

`npm install mistralai`

## Usage

### Chat

The simplest use case is to chat with Mistral AI models:

```javascript
const client = require("mistralai");

const response = client.chat('le-tiny', [{role: 'user', content: 'What is your favourite French food, and why is it mayonnaise?'}])

```

You can also use `client.chatStream` for streaming results.

### Embeddings

To use our embedding API you can use the following code:

```javascript
const client = require('mistralai');

const response = client.embed('le-embed', 'My favourite place to eat mayonnaise is embed');
```

## Run examples

Examples can be found in the `examples/` directory you can run them using:

```bash
node [example.js]

```
