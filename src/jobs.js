/**
 * Class representing a client for job operations.
 */
class JobsClient {
  /**
   * Create a JobsClient object.
   * @param {MistralClient} client - The client object used for making requests.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new job.
   * @param {string} model - The model to be used for the job.
   * @param {Array<string>} trainingFiles - The list of training files.
   * @param {Array<string>} validationFiles - The list of validation files.
   * @param {TrainingParameters} hyperparameters - The hyperparameters.
   * @param {string} suffix - The suffix for the job.
   * @param {Array<Integration>} integrations - The integrations for the job.
   * @return {Promise<*>} A promise that resolves to a Job object.
   * @throws {MistralAPIError} If no response is received from the server.
   */
  async create({
    model,
    trainingFiles,
    validationFiles = [],
    hyperparameters = {
      training_steps: 1800,
      learning_rate: 1.0e-4,
    },
    suffix = null,
    integrations = null,
  }) {
    const response = await this.client._request('post', 'v1/fine_tuning/jobs', {
      model,
      training_files: trainingFiles,
      validation_files: validationFiles,
      hyperparameters,
      suffix,
      integrations,
    });
    return response;
  }

  /**
   * Retrieve a job.
   * @param {string} jobId - The ID of the job to retrieve.
   * @return {Promise<*>} A promise that resolves to the job data.
   */
  async retrieve({jobId}) {
    const response = await this.client._request(
      'get', `v1/fine_tuning/jobs/${jobId}`, {},
    );
    return response;
  }

  /**
   * List all jobs.
   * @return {Promise<Array<Job>>} A promise that resolves to an array of Job.
   */
  async list() {
    const response = await this.client._request(
      'get', 'v1/fine_tuning/jobs', {},
    );
    return response;
  }

  /**
   * Cancel a job.
   * @param {string} jobId - The ID of the job to cancel.
   * @return {Promise<*>} A promise that resolves to the response.
   */
  async cancel({jobId}) {
    const response = await this.client._request(
      'post', `v1/fine_tuning/jobs/${jobId}/cancel`, {},
    );
    return response;
  }
}

export default JobsClient;
