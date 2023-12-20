This javascript client is inspired from [cohere-typescript](https://github.com/cohere-ai/cohere-typescript)

# Mistral Javascript Client

You can use the Mistral Javascript client to interact with the Mistral AI API.

## Installing

You can install the library in your project using:

`npm install @mistralai/mistralai`

## Run examples

You can run the examples in the examples directory by installing them locally:

```bash
cd examples
npm install .
```

### API Key Setup

Running the examples requires a Mistral AI API key.

1. Get your own Mistral API Key: <https://docs.mistral.ai/#api-access>
2. Set your Mistral API Key as an environment variable. You only need to do this once.

```bash
# set Mistral API Key (using zsh for example)
$ echo 'export MISTRAL_API_KEY=[your_key_here]' >> ~/.zshenv

# reload the environment (or just quit and open a new terminal)
$ source ~/.zshenv
```

You can then run the examples using node:

```bash
MISTRAL_API_KEY=XXXX node chat_with_streaming.js
```
