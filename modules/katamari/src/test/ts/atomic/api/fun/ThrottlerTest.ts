import { Assert, describe, it } from '@ephox/bedrock-client';
import Promise from '@ephox/wrap-promise-polyfill';
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
      Assert.eq('eq', [ 'frog' ], data);
      throttler.throttle('frog-goose');
      throttler.throttle('goose');
      setTimeout(() => {
        Assert.eq('eq', [ 'frog', 'goose' ], data);
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
      Assert.eq('eq', [ 'cat' ], data);
      throttler.throttle('frog-goose');
      throttler.throttle('goose');
      setTimeout(() => {
        Assert.eq('eq', [ 'cat', 'frog-goose' ], data);
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
      Assert.eq('eq', [ 'frog' ], data);
      throttler.throttle('frog-goose');
      throttler.throttle('goose');
      setTimeout(() => {
        Assert.eq('eq', [ 'frog', 'goose' ], data);
        success();
      }, 500);
    }, 500);
  }));
});
