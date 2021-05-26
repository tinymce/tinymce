import { describe, it } from '@ephox/bedrock-client';
import Promise from '@ephox/wrap-promise-polyfill';
import { assert } from 'chai';
import * as Throttler from 'ephox/katamari/api/Throttler';

describe('atomic.katamari.api.fun.ThrottlerTest', () => {

  it('Throttler.adaptable', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.adaptable((value: string) => {
      data.push(value);
    }, 250);

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
      }, 500);
    }, 500);
  }));

  it('Throttler.first', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.first((value: string) => {
      data.push(value);
    }, 250);

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
      }, 500);
    }, 500);
  }));

  it('Throttler.last', () => new Promise<void>((success) => {
    const data: string[] = [];
    const throttler = Throttler.last((value: string) => {
      data.push(value);
    }, 250);

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
      }, 500);
    }, 500);
  }));
});
