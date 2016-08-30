test(
  'Function tests',

  [
    'ephox.katamari.api.Fun',
    'global!Array'
  ],

  function (Fun, Array) {
  
  var testSanity = function () {
    var add2 = function (n) {
      return n + 2;
    };

    var squared = function (n) {
      return n * n;
    };

    var add2squared = Fun.compose(squared, add2);

    assert.eq(16, add2squared(2));

    assert.eq(undefined, Fun.identity(undefined));
    assert.eq(10, Fun.identity(10));
    assert.eq([1, 2, 4], Fun.identity([1, 2, 4]));
    assert.eq({a: 'a', b: 'b'}, Fun.identity({a: 'a', b: 'b'}));

    assert.eq(undefined, Fun.constant()());
    assert.eq(10, Fun.constant(10)());
    assert.eq({a: 'a'}, Fun.constant({a: 'a'})());

    assert.eq(false, Fun.never());
    assert.eq(true, Fun.always());

    var c = function (/* arguments */) {
      return Array.prototype.slice.call(arguments, 0);
    };

    assert.eq([], Fun.curry(c)());
    assert.eq(['a'], Fun.curry(c, 'a')());
    assert.eq(['a', 'b'], Fun.curry(c, 'a')('b'));
    assert.eq(['a', 'b'], Fun.curry(c)('a', 'b'));
    assert.eq(['a', 'b', 'c'], Fun.curry(c)('a', 'b', 'c'));
    assert.eq(['a', 'b', 'c'], Fun.curry(c, 'a', 'b')('c'));

    assert.eq(false, Fun.not(function () { return true; })());
    assert.eq(true, Fun.not(function () { return false; })());

    assert.throws(Fun.die('Died!'));

    var called = false;
    var f = function () {
      called = true;
    };
    Fun.apply(f);
    assert.eq(true, called);
    called = false;
    Fun.apply(f);
    assert.eq(true, called);

  };

  testSanity();
});