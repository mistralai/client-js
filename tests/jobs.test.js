import MistralClient from '../src/client';
import {
  mockFetch,
  mockJobResponsePayload,
  mockJobsResponsePayload,
  mockDeletedJobResponsePayload,
} from './utils';

// Test the jobs endpoint
describe('Mistral Client', () => {
  let client;
  beforeEach(() => {
    client = new MistralClient();
  });

  describe('createJob()', () => {
    it('should return a job response object', async() => {
      // Mock the fetch function
      const mockResponse = mockJobResponsePayload();
      client._fetch = mockFetch(200, mockResponse);

      const response = await client.jobs.create({
        model: 'mistral-medium',
        trainingFiles: [],
        validationFiles: [],
        hyperparameters: {
          training_steps: 1800,
          learning_rate: 1.0e-4,
        },
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('retrieveJob()', () => {
    it('should return a job response object', async() => {
      // Mock the fetch function
      const mockResponse = mockJobResponsePayload();
      client._fetch = mockFetch(200, mockResponse);

      const response = await client.jobs.retrieve({
        jobId: 'jobId',
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('listJobs()', () => {
    it('should return a list of jobs response object', async() => {
      // Mock the fetch function
      const mockResponse = mockJobsResponsePayload();
      client._fetch = mockFetch(200, mockResponse);

      const response = await client.jobs.list();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('cancelJob()', () => {
    it('should return a deleted job response object', async() => {
      // Mock the fetch function
      const mockResponse = mockDeletedJobResponsePayload();
      client._fetch = mockFetch(200, mockResponse);

      const response = await client.jobs.cancel({
        jobId: 'jobId',
      });
      expect(response).toEqual(mockResponse);
    });
  });
});
