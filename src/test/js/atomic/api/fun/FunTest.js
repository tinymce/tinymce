test(
  'Function tests',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
  var add2 = function (n) {
    return n + 2;
  };

  var squared = function (n) {
    return n * n;
  };

  var add2squared = Fun.compose(squared, add2);

  assert.eq(16, add2squared(2));
});

test('Identity', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  assert.eq(undefined, Fun.identity(undefined));
  assert.eq(10, Fun.identity(10));
  assert.eq([1, 2, 4], Fun.identity([1, 2, 4]));
  assert.eq({a: 'a', b: 'b'}, Fun.identity({a: 'a', b: 'b'}));
});

test('Constant', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  assert.eq(undefined, Fun.constant()());
  assert.eq(10, Fun.constant(10)());
  assert.eq({a: 'a'}, Fun.constant({a: 'a'})());
});

test('Never', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  assert.eq(false, Fun.never());
});

test('Always', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  assert.eq(true, Fun.always());
});

test('Curry', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  var c = function (/* arguments */) {
    return Array.prototype.slice.call(arguments, 0);
  };

  assert.eq([], Fun.curry(c)());
  assert.eq(['a'], Fun.curry(c, 'a')());
  assert.eq(['a', 'b'], Fun.curry(c, 'a')('b'));
  assert.eq(['a', 'b'], Fun.curry(c)('a', 'b'));
  assert.eq(['a', 'b', 'c'], Fun.curry(c)('a', 'b', 'c'));
  assert.eq(['a', 'b', 'c'], Fun.curry(c, 'a', 'b')('c'));
});

test('Not', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  assert.eq(false, Fun.not(function () { return true; })());
  assert.eq(true, Fun.not(function () { return false; })());
});

test('Die', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  assert.throws(Fun.die('Died!'));
});

test('Apply', [ 'ephox.katamari.api.Fun' ], function (Fun) {
  var called = false;
  var f = function () {
    called = true;
  };
  Fun.apply(f);
  assert.eq(true, called);
  called = false;
  Fun.apply(f);
  assert.eq(true, called);
});