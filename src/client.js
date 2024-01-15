class MistralClient {
  /**
   * Creates a chat completion request
   * @param {*} model
   * @param {*} messages
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} stream
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt
   * @return {Promise<Object>}
   */
  _makeChatCompletionRequest = function (
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    stream,
    safeMode,
    safePrompt
  ) {
    return {
      model: model,
      messages: messages,
      temperature: temperature ?? undefined,
      max_tokens: maxTokens ?? undefined,
      top_p: topP ?? undefined,
      random_seed: randomSeed ?? undefined,
      stream: stream ?? undefined,
      safe_prompt: (safeMode || safePrompt) ?? undefined,
    };
  };

  /**
   * Returns a list of the available models
   * @return {Promise<Object>}
   */
  listModels = async function () {
    const response = await this._request("get", "v1/models");
    return response;
  };

  /**
   * A chat endpoint without streaming
   * @param {*} model the name of the model to chat with, e.g. mistral-tiny
   * @param {*} messages an array of messages to chat with, e.g.
   * [{role: 'user', content: 'What is the best French cheese?'}]
   * @param {*} temperature the temperature to use for sampling, e.g. 0.5
   * @param {*} maxTokens the maximum number of tokens to generate, e.g. 100
   * @param {*} topP the cumulative probability of tokens to generate, e.g. 0.9
   * @param {*} randomSeed the random seed to use for sampling, e.g. 42
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt whether to use safe mode, e.g. true
   * @return {Promise<Object>}
   */
  chat = async function ({
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode,
    safePrompt,
  }) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      false,
      safeMode,
      safePrompt
    );
    const response = await this._request(
      "post",
      "v1/chat/completions",
      request
    );
    return response;
  };

  /**
   * A chat endpoint that streams responses.
   * @param {*} model the name of the model to chat with, e.g. mistral-tiny
   * @param {*} messages an array of messages to chat with, e.g.
   * [{role: 'user', content: 'What is the best French cheese?'}]
   * @param {*} temperature the temperature to use for sampling, e.g. 0.5
   * @param {*} maxTokens the maximum number of tokens to generate, e.g. 100
   * @param {*} topP the cumulative probability of tokens to generate, e.g. 0.9
   * @param {*} randomSeed the random seed to use for sampling, e.g. 42
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt whether to use safe mode, e.g. true
   * @return {Promise<Object>}
   */
  chatStream = async function* ({
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode,
    safePrompt,
  }) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      true,
      safeMode,
      safePrompt
    );
    const response = await this._request(
      "post",
      "v1/chat/completions",
      request
    );

    let buffer = "";
    const decoder = new TextDecoder();
    for await (const chunk of response) {
      buffer += decoder.decode(chunk, { stream: true });
      let firstNewline;
      while ((firstNewline = buffer.indexOf("\n")) !== -1) {
        const chunkLine = buffer.substring(0, firstNewline);
        buffer = buffer.substring(firstNewline + 1);
        if (chunkLine.startsWith("data:")) {
          const json = chunkLine.substring(6).trim();
          if (json !== "[DONE]") {
            yield JSON.parse(json);
          }
        }
      }
    }
  };

  /**
   * An embeddings endpoint that returns embeddings for a single,
   * or batch of inputs
   * @param {*} model The embedding model to use, e.g. mistral-embed
   * @param {*} input The input to embed,
   * e.g. ['What is the best French cheese?']
   * @return {Promise<Object>}
   */
  embeddings = async function ({ model, input }) {
    const request = {
      model: model,
      input: input,
    };
    const response = await this._request("post", "v1/embeddings", request);
    return response;
  };
}

export default MistralClient;
