import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import * as Singleton from 'ephox/katamari/api/Singleton';

const delay = (ms: number): Promise<never> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Wait for a condition instead of counting ticks in a fixed window; interval timers are not
// precise enough under CI load for exact tick counts
const waitUntil = (predicate: () => boolean, timeoutMs: number = 10000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const checker = setInterval(() => {
      if (predicate()) {
        clearInterval(checker);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(checker);
        reject(new Error('Timed out waiting for repeatable to fire'));
      }
    }, 10);
  });
};

describe('browser.katamari.RepeatableTests', () => {
  it('Make a repeatable then clean it', async () => {
    const intervalId = Singleton.repeatable(100);
    assert.strictEqual(intervalId.get(), Optional.none());

    let firstCounter = 0;
    intervalId.set(() => {
      firstCounter++;
    });
    // Reaching 2 proves the function repeats rather than firing once
    await waitUntil(() => firstCounter >= 2);
    const currentId = intervalId.get().getOrNull();
    assert.isNotNull(currentId);

    let secondCounter = 0;
    intervalId.set(() => {
      secondCounter++;
    });
    // revoke() in set() is synchronous, so the first counter must be frozen from here on
    const firstCounterAtReplace = firstCounter;
    await waitUntil(() => secondCounter >= 2);
    assert.strictEqual(firstCounter, firstCounterAtReplace, 'Replaced interval should stop firing');
    const newId = intervalId.get().getOrNull();
    assert.isNotNull(newId);
    assert.notStrictEqual(currentId, newId);
    assert.isTrue(intervalId.isSet());

    intervalId.clear();
    assert.isFalse(intervalId.isSet());
    assert.strictEqual(intervalId.get(), Optional.none());
    const secondCounterAtClear = secondCounter;
    await delay(250); // Waiting to make sure that the interval does not run again
    assert.strictEqual(secondCounter, secondCounterAtClear, 'Cleared interval should not fire');
  });
});
