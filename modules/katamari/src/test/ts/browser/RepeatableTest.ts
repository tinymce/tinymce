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
    intervalId.set(() => {
      counter++;
    });
    await delay(250);
    assert.strictEqual(counter, 2);
    const currentId = intervalId.get().getOrNull();
    assert.isNotNull(currentId);
    intervalId.set(() => {
      counter--;
    });
    await delay(250);
    const newId = intervalId.get().getOrNull();
    assert.isNotNull(currentId);
    assert.notStrictEqual(currentId, newId);
    assert.strictEqual(counter, 0);
    assert.isTrue(intervalId.isSet());
    intervalId.clear();
    assert.isFalse(intervalId.isSet());
    assert.strictEqual(intervalId.get(), Optional.none());
    await delay(150);
    assert.strictEqual(counter, 0);
  });
});
