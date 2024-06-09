/**
 * MistralAPIError
 * @return {MistralAPIError}
 * @extends {Error}
 */
export class MistralAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MistralAPIError';
  }
}
