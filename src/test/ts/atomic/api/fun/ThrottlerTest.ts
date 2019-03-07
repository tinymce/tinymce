import { Future } from 'ephox/katamari/api/Future';
import * as Throttler from 'ephox/katamari/api/Throttler';
import { UnitTest, assert } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';

UnitTest.asynctest('ThrottlerTest', (success, failure) => {

  const testAdaptable = function () {
    return Future.nu(function (callback) {
      const data = [];
      const throttler = Throttler.adaptable(function (value) {
        data.push(value);
      }, 250);

      throttler.throttle('cat');
      throttler.throttle('dog');
      throttler.throttle('elephant');
      throttler.throttle('frog');

      setTimeout(function () {
        assert.eq([ 'frog' ], data);
        throttler.throttle('frog-goose');
        throttler.throttle('goose');
        setTimeout(function () {
          assert.eq([ 'frog', 'goose' ], data);
          callback();
        }, 500);
      }, 500);
    });
  };

  const testFirst = function () {
    return Future.nu(function (callback) {
      const data = [];
      const throttler = Throttler.first(function (value) {
        data.push(value);
      }, 250);

      throttler.throttle('cat');
      throttler.throttle('dog');
      throttler.throttle('elephant');
      throttler.throttle('frog');

      setTimeout(function () {
        assert.eq([ 'cat' ], data);
        throttler.throttle('frog-goose');
        throttler.throttle('goose');
        setTimeout(function () {
          assert.eq([ 'cat', 'frog-goose' ], data);
          callback();
        }, 500);
      }, 500);
    });
  };

  const testLast = function () {
    return Future.nu(function (callback) {
      const data = [];
      const throttler = Throttler.last(function (value) {
        data.push(value);
      }, 250);

      throttler.throttle('cat');
      throttler.throttle('dog');
      throttler.throttle('elephant');
      throttler.throttle('frog');

      setTimeout(function () {
        assert.eq([ 'frog' ], data);
        throttler.throttle('frog-goose');
        throttler.throttle('goose');
        setTimeout(function () {
          assert.eq([ 'frog', 'goose' ], data);
          callback();
        }, 500);
      }, 500);
    });
  };

  testAdaptable().bind(testFirst).bind(testLast).get(function () {
    success();
  });
});

