import MistralClient from '@mistralai/mistralai';
import fs from 'node:fs';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new MistralClient(apiKey);
const log = console.log;

const CHUNKS_BEFORE_ABORTING = 10;

/**
 * @param {*} repro - json
 * @return {Promise<void>}
 */
async function loop(repro) {
  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    let num = 0;

    try {
      const requestWithSignal = {...repro, signal: controller.signal};
      for await (const chunk of client.chatStream(requestWithSignal)) {
        num++;
        log('attempt', attempt, 'chunk', num, JSON.stringify(chunk));

        // Adjust this number as per your requirement
        if (num === CHUNKS_BEFORE_ABORTING) {
          controller.abort();
          log(
            'Early abort, likely to succeed, ' +
              'stops usually happen in earliest chunks\n',
          );
          break;
        }
      }

      if (!controller.signal.aborted) {
        log('Stream completed');
        break;
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        throw error;
      } else {
        log('Stream aborted, restarting...');
      }
    }
  }
}

async function main() {
  const reproJSONFile = process.argv[2];
  if (!reproJSONFile) {
    console.error('Pass path to repro request');
    process.exit(1);
  } else {
    const repro = JSON.parse(fs.readFileSync(process.argv[2]).toString());
    await loop(repro);
  }
}

main().catch(console.error);
