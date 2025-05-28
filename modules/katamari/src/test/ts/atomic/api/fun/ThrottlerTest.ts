import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Throttler from 'ephox/katamari/api/Throttler';

describe('atomic.katamari.api.fun.ThrottlerTest', () => {

  it('Throttler.adaptable', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.adaptable((value: string) => {
      data.push(value);
    }, 100);

    throttler.throttle('cat');
    throttler.throttle('dog');
    throttler.throttle('elephant');
    throttler.throttle('frog');

    setTimeout(() => {
      assert.deepEqual(data, [ 'frog' ]);
      throttler.throttle('frog-goose');
      throttler.throttle('goose');
      setTimeout(() => {
        assert.deepEqual(data, [ 'frog', 'goose' ]);
        success();
      }, 200);
    }, 200);
  }));

  it('Throttler.adaptable can throttle within the callback function', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.adaptable((value: string) => {
      data.push(value);
      if (value === 'retry') {
        throttler.throttle('retried');
      }
    }, 75);

    throttler.throttle('retry');

    setTimeout(() => {
      assert.deepEqual(data, [ 'retry', 'retried' ]);
      success();
    }, 250);
  }));

  it('Throttler.first', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.first((value: string) => {
      data.push(value);
    }, 100);

    throttler.throttle('cat');
    throttler.throttle('dog');
    throttler.throttle('elephant');
    throttler.throttle('frog');

    setTimeout(() => {
      assert.deepEqual(data, [ 'cat' ]);
      throttler.throttle('frog-goose');
      throttler.throttle('goose');
      setTimeout(() => {
        assert.deepEqual(data, [ 'cat', 'frog-goose' ]);
        success();
      }, 200);
    }, 200);
  }));

  it('Throttler.last', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.last((value: string) => {
      data.push(value);
    }, 100);

    throttler.throttle('cat');
    throttler.throttle('dog');
    throttler.throttle('elephant');
    throttler.throttle('frog');

    setTimeout(() => {
      assert.deepEqual(data, [ 'frog' ]);
      throttler.throttle('frog-goose');
      throttler.throttle('goose');
      setTimeout(() => {
        assert.deepEqual(data, [ 'frog', 'goose' ]);
        success();
      }, 200);
    }, 200);
  }));

  it('Throttler.withPriority', () => async () => {
    const delay = 1;
    const data: string[] = [];
    const throttler = Throttler.withPriority((value: string) => {
      data.push(value);
    }, delay);

    throttler.throttle(false, 'cat');
    throttler.throttle(true, 'dog');
    await Waiter.pWait(delay + 1);
    assert.deepEqual(data, [ 'dog' ]);

    throttler.throttle(true, 'cat');
    throttler.throttle(false, 'dog');
    await Waiter.pWait(delay + 1);
    assert.deepEqual(data, [ 'dog', 'cat' ]);

    throttler.throttle(false, 'cat');
    throttler.throttle(false, 'dog');
    await Waiter.pWait(delay + 1);
    assert.deepEqual(data, [ 'dog', 'cat', 'cat' ]);

    throttler.throttle(true, 'cat');
    throttler.throttle(true, 'dog');
    await Waiter.pWait(delay + 1);
    assert.deepEqual(data, [ 'dog', 'cat', 'cat', 'dog' ]);
  });
});
