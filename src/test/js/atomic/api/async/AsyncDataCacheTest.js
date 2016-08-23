asynctest(
  'AsyncDataCacheTest',

  [
    'ephox.katamari.api.AsyncDataCache',
    'global!setTimeout'
  ],

  function (AsyncDataCache, setTimeout, success, failure) {
    var called = 0;

    var getCheck = function (expected) {
      return function (actual) {
        called++;
        assert.eq(expected, actual);
      };
    };

    var data = 'the data';

    var cache = AsyncDataCache();
    assert.eq(false, cache.isSet());
    cache.get(getCheck(data));
    cache.get(getCheck(data));
    cache.set(data);
    assert.eq(true, cache.isSet());
    cache.get(getCheck(data));

    assert.eq(0, called);

    setTimeout(function () {
      assert.eq(3, called);
      success();
    }, 100);
  }
);