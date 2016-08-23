asynctest(
  'CachedFuture.get',

  [
    'ephox.katamari.api.CachedFuture',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (CachedFuture, Fun, setTimeout, success, failure) {
    CachedFuture.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'blah'), 10);
    }).get(function(a) {
      assert.eq('blah', a);
      success();
    });
  }
);

asynctest(
  'CachedFuture.map',

  [
    'ephox.katamari.api.CachedFuture',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (CachedFuture, Fun, setTimeout, success, failure) {
    var fut = CachedFuture.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'blah'), 10);
    });

    var f = function(x) {
      return x + "hello";
    };

    fut.map(f).get(function(a) {
      assert.eq('blahhello', a);
      success();
    });
  }
);

asynctest(
  'CachedFuture.bind',

  [
    'ephox.katamari.api.CachedFuture',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (CachedFuture, Fun, setTimeout, success, failure) {
    var fut = CachedFuture.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'blah'), 10);
    });

    var f = function(x) {
      return CachedFuture.nu(function(callback) {
        callback(x + "hello");
      });
    };

    fut.bind(f).get(function(a) {
      assert.eq('blahhello', a);
      success();
    });
  }
);

asynctest(
  'CachedFuture.anonBind',

  [
    'ephox.katamari.api.CachedFuture',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (CachedFuture, Fun, setTimeout, success, failure) {
    var called = false;

    var fut = CachedFuture.nu(function(callback) {
      called = true;
      setTimeout(Fun.curry(callback, 'blah'), 10);
    });

    var f = CachedFuture.nu(function(callback) {
      callback("hello");
    });

    fut.anonBind(f).get(function(a) {
      assert.eq('hello', a);
      assert.eq(true, called);
      success();
    });
  }
);

asynctest(
  'CachedFuture.pure',

  [
    'ephox.katamari.api.CachedFuture',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (CachedFuture, Fun, setTimeout, success, failure) {
    CachedFuture.pure('hello').get(function(a) {
      assert.eq('hello', a);
      success();
    });
  }
);