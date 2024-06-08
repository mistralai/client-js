import MistralClient from '../src/mistral-client';
import {
  mockFetch,
  mockFileResponsePayload,
  mockFilesResponsePayload,
  mockDeletedFileResponsePayload,
} from './test-utils';

// Test the list models endpoint
describe('Mistral Client', () => {
  let client:MistralClient;
  beforeEach(() => {
    client = new MistralClient();
  });

  describe('create()', () => {
    it('should return a file response object', async() => {
      // Mock the fetch function
      const mockResponse = mockFileResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;
      const mockFile = new File(["file content"], "test.txt", { type: "text/plain" });
      const response = await client.files.create({
        file: mockFile,
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('retrieve()', () => {
    it('should return a file response object', async() => {
      // Mock the fetch function
      const mockResponse = mockFileResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.files.retrieve({
        fileId: 'fileId',
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('retrieve()', () => {
    it('should return a list of files response object', async() => {
      // Mock the fetch function
      const mockResponse = mockFilesResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.files.list();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('delete()', () => {
    it('should return a deleted file response object', async() => {
      // Mock the fetch function
      const mockResponse = mockDeletedFileResponsePayload();
      client['_fetch'] = mockFetch(200, mockResponse) as any;

      const response = await client.files.delete({
        fileId: 'fileId',
      });
      expect(response).toEqual(mockResponse);
    });
  });
});
