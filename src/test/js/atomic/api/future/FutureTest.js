asynctest(
  'FutureGetTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'blah'), 10);
    }).get(function(a) {
      assert.eq('blah', a);
      success();
    });
  }
);

asynctest(
  'FutureMapTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var fut = Future.nu(function(callback) {
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
  'FutureBindTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var fut = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'blah'), 10);
    });

    var f = function(x) {
      return Future.nu(function(callback) {
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
  'FutureAnonBindTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var called = false;

    var fut = Future.nu(function(callback) {
      called = true;
      setTimeout(Fun.curry(callback, 'blah'), 10);
    });

    var f = Future.nu(function(callback) {
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
  'FuturePureTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    Future.pure('hello').get(function(a) {
      assert.eq('hello', a);
      success();
    });
  }
);

asynctest(
  'FutureParallelTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var f = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'apple'), 10);
    });
    var g = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'banana'), 5);
    });
    var h = Future.nu(function(callback) {
      callback('carrot');
    });


    Future.par([f, g, h]).get(function(r){
      assert.eq(r[0], 'apple');
      assert.eq(r[1], 'banana');
      assert.eq(r[2], 'carrot');
      success();
    });
  }
);

asynctest(
  'FutureLift2Test',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var fa = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'apple'), 50);
    });
    var fb = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'banana'), 5);
    });

    Future.lift2(fa, fb, function(a, b) { return [a, 3, b]; }).get(function(r) {
      assert.eq(['apple', 3, 'banana'], r);
      success();
    });
  }
);

asynctest(
  'FutureLift2Test2',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var fa = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'apple'), 5);
    });
    var fb = Future.nu(function(callback) {
      setTimeout(Fun.curry(callback, 'banana'), 50);
    });

    Future.lift2(fa, fb, function(a, b) { return [a, 3, b]; }).get(function(r) {
      assert.eq(['apple', 3, 'banana'], r);
      success();
    });
  }
);

asynctest(
  'FutureMapMTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var fn = function(a) {
      return Future.nu(function(cb) {
        setTimeout(Fun.curry(cb, a + " bizarro"), 10);
      });
    };

    Future.mapM(['q', 'r', 's'], fn).get(function(r){
      assert.eq(['q bizarro', 'r bizarro', 's bizarro'], r);
      success();
    });
  }
);



asynctest(
  'ComposeTest',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun',
    'global!setTimeout'
  ],

  function (Future, Fun, setTimeout, success, failure) {
    var f = function(a) {
      return Future.nu(function(cb) {
        setTimeout(Fun.curry(cb, a + " f"), 10);
      });
    };

    var g = function(a) {
      return Future.nu(function(cb) {
        setTimeout(Fun.curry(cb, a + " g"), 10);
      });
    };

    Future.compose(f, g)('a').get(function(r) {
      assert.eq('a g f', r);
      success();
    });
  }
);
