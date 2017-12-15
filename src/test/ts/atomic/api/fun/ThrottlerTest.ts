import Future from 'ephox/katamari/api/Future';
import Throttler from 'ephox/katamari/api/Throttler';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('ThrottlerTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var testAdaptable = function () {
    return Future.nu(function (callback) {
      var data = [];
      var throttler = Throttler.adaptable(function (value) {
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

  var testFirst = function () {
    return Future.nu(function (callback) {
      var data = [];
      var throttler = Throttler.first(function (value) {
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

  var testLast = function () {
    return Future.nu(function (callback) {
      var data = [];
      var throttler = Throttler.last(function (value) {
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

