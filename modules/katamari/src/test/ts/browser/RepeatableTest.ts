import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import * as Singleton from 'ephox/katamari/api/Singleton';

const delay = (ms: number): Promise<never> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe('browser.katamari.RepeatableTests', () => {
  it('Make a repeatable then clean it', async () => {
    const intervalId = Singleton.repeatable(100);
    assert.strictEqual(intervalId.get(), Optional.none());
    let counter = 0;
    let start = Date.now();
    intervalId.set(() => {
      counter++;
    });
    await delay(250);
    let end = Date.now();
    assert.strictEqual(counter, 2);
    assert.isAbove(end - start, 200);
    const currentId = intervalId.get().getOrNull();
    assert.isNotNull(currentId);
    start = Date.now();
    intervalId.set(() => {
      counter--;
    });
    await delay(250);
    end = Date.now();
    const newId = intervalId.get().getOrNull();
    assert.isNotNull(currentId);
    assert.notStrictEqual(currentId, newId);
    assert.strictEqual(counter, 0);
    assert.isTrue(intervalId.isSet());
    assert.isAbove(end - start, 200);
    intervalId.clear();
    assert.isFalse(intervalId.isSet());
    assert.strictEqual(intervalId.get(), Optional.none());
    start = Date.now();
    await delay(150); // Waiting to make sure that interval did not run again
    end = Date.now();
    assert.isAbove(end - start, 100);
    assert.strictEqual(counter, 0);
  });
});
