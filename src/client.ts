import fetch from "isomorphic-fetch";

/**
 * Client for interacting with the Mistral API
 *
 * @class
 */
export class MistralClient {}

/**
 * Represents an error specific to the Mistral API.
 *
 * @extends Error
 */
export class MistralClientError extends Error {
  public name = "MistralClientError";

  /**
   * Creates a new MistralClientError instance.
   *
   * @param {string} message - The error message that describes the nature of the error.
   */
  constructor(message: string) {
    super(message);
    // Since 'Error' breaks the prototype chain, we restore it here.
    Object.setPrototypeOf(this, MistralClientError.prototype);
  }
}

/****************************************************
 Entities
****************************************************/
