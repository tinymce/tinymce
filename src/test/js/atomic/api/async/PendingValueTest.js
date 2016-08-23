asynctest(
  'PendingValueTest',

  [
    'ephox.katamari.api.PendingValue',
    'global!setTimeout'
  ],

  function (PendingValue, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var called = 0;

    var getCheck = function (expected) {
      return function (actual) {
        called++;
        assert.eq(expected, actual);
      };
    };

    var data = 'the data';

    var pval = PendingValue();
    assert.eq(false, pval.isAvailable());
    pval.onReady(getCheck(data));
    pval.onReady(getCheck(data));
    pval.set(data);
    assert.eq(true, pval.isAvailable());
    pval.onReady(getCheck(data));

    assert.eq(0, called);

    setTimeout(function () {
      assert.eq(3, called);
      success();
    }, 100);
  }
);