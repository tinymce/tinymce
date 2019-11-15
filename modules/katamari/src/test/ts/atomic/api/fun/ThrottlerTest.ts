import * as Throttler from 'ephox/katamari/api/Throttler';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { setTimeout } from '@ephox/dom-globals';

UnitTest.asynctest('Throttler.adaptable', (success) => {
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
});

UnitTest.asynctest('Throttler.first', (success) => {
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
});

UnitTest.asynctest('Throttler.last', (success) => {
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
});
