import MistralClient from '@mistralai/mistralai';
import * as fs from 'fs';


const apiKey = process.env.MISTRAL_API_KEY;

const client = new MistralClient(apiKey);

// Create a new file
const blob = new Blob(
  [fs.readFileSync('file.jsonl')],
  {type: 'application/json'},
);
const createdFile = await client.files.create({file: blob});
console.log(createdFile);

// List files
const files = await client.files.list();
console.log(files);

// Retrieve a file
const retrievedFile = await client.files.retrieve({fileId: createdFile.id});
console.log(retrievedFile);

// Delete a file
const deletedFile = await client.files.delete({fileId: createdFile.id});
console.log(deletedFile);
