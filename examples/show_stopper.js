import MistralClient from '@mistralai/mistralai';
import fs from 'node:fs';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new MistralClient(apiKey);
const log = console.log;

/**
 * @param {*} repro - json
 * @param {*} seed
 * @param {*} chunksBeforeAborting
 * @return {Promise<void>}
 */
async function loop(repro, seed, chunksBeforeAborting) {
  let attempt = 0;
  while (true) {
    const randomSeed = seed + attempt;
    attempt++;
    const controller = new AbortController();
    let num = 0;

    try {
      const requestWithSignal = {
        ...repro,
        randomSeed: randomSeed,
        signal: controller.signal,
      };
      for await (const chunk of await client.chatStream(requestWithSignal)) {
        num++;
        log('attempt', attempt, 'chunk', num, JSON.stringify(chunk));

        // Adjust this number as per your requirement
        if (
          num === chunksBeforeAborting &&
          chunk.choices[0].finish_reason !== 'stop'
        ) {
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
  const seed = process.argv[3];
  const numChunks = process.argv[4];
  if (!reproJSONFile || !seed) {
    console.error(
      'show_stopper.js <path-to-repro> <seed-number> <chunks-before-aborting>',
    );
    process.exit(1);
  } else {
    const repro = JSON.parse(fs.readFileSync(process.argv[2]).toString());
    await loop(repro, Number(seed), Number(numChunks));
  }
}

main().catch(console.error);
