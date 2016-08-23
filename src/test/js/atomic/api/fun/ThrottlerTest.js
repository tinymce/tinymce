asynctest(
  'ThrottlerTest',

  [
    'ephox.katamari.api.Throttler',
    'global!setTimeout'
  ],

  function (Throttler, setTimeout, success, failure) {
    var data = [];
    var throttler = Throttler(function (value) {
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
        success();
      }, 500);
    }, 500);
  }
);