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

// Create a new job
const hyperparameters = {
  training_steps: 10,
  learning_rate: 0.0001,
};
const createdJob = await client.jobs.create({
  model: 'open-mistral-7b',
  trainingFiles: [createdFile.id],
  validationFiles: [createdFile.id],
  hyperparameters,
});
console.log(createdJob);

// List jobs
const jobs = await client.jobs.list();
console.log(jobs);

// Retrieve a job
const retrievedJob = await client.jobs.retrieve({jobId: createdJob.id});
console.log(retrievedJob);

// Cancel a job
const canceledJob = await client.jobs.cancel({jobId: createdJob.id});
console.log(canceledJob);
