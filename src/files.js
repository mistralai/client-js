/**
 * Class representing a client for file operations.
 */
class FilesClient {
  /**
   * Create a FilesClient object.
   * @param {MistralClient} client - The client object used for making requests.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new file.
   * @param {File} file - The file to be created.
   * @param {string} purpose - The purpose of the file. Default is 'fine-tune'.
   * @return {Promise<*>} A promise that resolves to a FileObject.
   * @throws {MistralAPIError} If no response is received from the server.
   */
  async create({file, purpose = 'fine-tune'}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    const response = await this.client._request(
      'post',
      'v1/files',
      null,
      undefined,
      formData,
    );
    return response;
  }

  /**
   * Retrieve a file.
   * @param {string} fileId - The ID of the file to retrieve.
   * @return {Promise<*>} A promise that resolves to the file data.
   */
  async retrieve({fileId}) {
    const response = await this.client._request('get', `v1/files/${fileId}`);
    return response;
  }

  /**
   * List all files.
   * @return {Promise<Array<FileObject>>} A promise that resolves to
   * an array of FileObject.
   */
  async list() {
    const response = await this.client._request('get', 'v1/files');
    return response;
  }

  /**
   * Delete a file.
   * @param {string} fileId - The ID of the file to delete.
   * @return {Promise<*>} A promise that resolves to the response.
   */
  async delete({fileId}) {
    const response = await this.client._request('delete', `v1/files/${fileId}`);
    return response;
  }
}

export default FilesClient;
