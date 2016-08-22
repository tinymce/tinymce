var boom = function(Fun) { throw "Should not be called"; };

var assertOptionEq = function(expected, actual) {
  var same = expected.isNone() ? actual.isNone() : (actual.isSome() && expected.getOrDie() === actual.getOrDie());
  if (!same) {
    // assumes toString() works
    assert.fail("Expected: " + expected.toString() + " Actual: " + actual.toString());
  }
};

test('SomeTest', ['ephox.katamari.api.Fun', 'ephox.katamari.api.Option'], function (Fun, Option) {
  var s = Option.some(5);
  assert.eq(true, s.isSome());
  assert.eq(false, s.isNone());
  assert.eq(5, s.getOr(6));
  assert.eq(5, s.getOrThunk(function () { return 6; }));
  assert.eq(5, s.getOrDie('Died!'));
  assert.eq(5, s.or(Option.some(6)).getOrDie());
  assert.eq(5, s.orThunk(boom).getOrDie());

  assert.eq(11, s.fold(boom, function (v) {
    return v + 6;
  }));

  assert.eq(10, s.map(function (v) {
    return v * 2;
  }).getOrDie());

  assert.eq('test5', s.bind(function (v) {
    return Option.some('test' + v);
  }).getOrDie());

  assert.eq(5, Option.some(s).flatten().getOrDie());
  assert.eq(true, Option.some(Option.none()).flatten().isNone());
  assert.eq(5, s.filter(Fun.constant(true)).getOrDie());
  assert.eq(true, s.filter(Fun.constant(false)).flatten().isNone());
});

test('NoneTest', [ 'ephox.katamari.api.Fun', 'ephox.katamari.api.Option' ], function (Fun, Option) {
  var s = Option.none();
  assert.eq(false, s.isSome());
  assert.eq(true, s.isNone());
  assert.eq(6, s.getOr(6));
  assert.eq(6, s.getOrThunk(function () { return 6; }));
  assert.throws(function () { s.getOrDie('Died!'); });
  assert.eq(6, s.or(Option.some(6)).getOrDie());
  assert.eq(6, s.orThunk(function () {
    return Option.some(6);
  }).getOrDie());


  assert.eq(true, s.map(function (v) {
    return v * 2;
  }).isNone());

  assert.eq(true, s.bind(function (v) {
    return Option.some('test' + v);
  }).isNone());

  assert.eq(true, s.flatten().isNone());
  assert.eq(true, s.filter(Fun.constant(true)).flatten().isNone());
  assert.eq(true, s.filter(Fun.constant(false)).flatten().isNone());
});

test('FromTest', [ 'ephox.katamari.api.Option' ], function (Option) {
  assert.eq(true, Option.from(5).isSome());
  assert.eq(5, Option.from(5).getOrDie('Died!'));
  assert.eq(false, Option.from(null).isSome());
  assert.eq(false, Option.from(undefined).isSome());
});

test('EqualTest', [ 'ephox.katamari.api.Option' ], function (Option) {
  assert.eq(true, Option.none().equals(Option.none()));
  assert.eq(false, Option.some(4).equals(Option.none()));
  assert.eq(false, Option.none().equals(Option.some(3)));
  assert.eq(false, Option.some(2).equals(Option.some(4)));
  assert.eq(true, Option.some(5).equals(Option.some(5)));
  assert.eq(false, Option.some(5.1).equals(Option.some(5.3)));
});

test('Equal_Test', [ 'ephox.katamari.api.Option' ], function (Option) {
  var req = function(a, b) { return Math.round(a) === Math.round(b); };

  assert.eq(true, Option.some(5.1).equals_(Option.some(5.3), req));
  assert.eq(false, Option.some(5.1).equals_(Option.some(5.9), req));
  assert.eq(true, Option.equals_(Option.some(5.1), Option.some(5.3), req));
});

test('ToArray_Test', [ 'ephox.katamari.api.Option' ], function (Option) {
  assert.eq([], Option.none().toArray());
  assert.eq([1], Option.some(1).toArray());
  assert.eq([{ cat: 'dog' }], Option.some({ cat: 'dog' }).toArray());
  assert.eq([[ 1 ]], Option.some([1]).toArray());
});

test('ap_test', [ 'ephox.katamari.api.Option' ], function (Option) {
  var plus2 = function(a) { return a + 2; };
  assert.eq(true, Option.some(5).ap(Option.some(plus2)).equals(Option.some(7)));
  assert.eq(true, Option.some(5).ap(Option.none()).equals(Option.none()));
  assert.eq(true, Option.none().ap(Option.some(boom)).equals(Option.none()));

  var Person = function(name) { return function(age) { return function(address) {
    return {name:name, age:age, address:address};
  }}};

  assert.eq({name:'bob', age:25, address:"the moon"}, Option.some("the moon").ap(Option.some(25).ap(Option.some("bob").map(Person))).getOrDie());

});

test('or_test', [ 'ephox.katamari.api.Option' ], function (Option) {
  assert.eq(true, Option.some(6).or(Option.some(7)).equals(Option.some(6)));
  assert.eq(true, Option.none().or(Option.some(7)).equals(Option.some(7)));
  assert.eq(true, Option.none().or(Option.none()).equals(Option.none()));
  assert.eq(true, Option.some(3).or(Option.none()).equals(Option.some(3)));
});

test('filter_test', [ 'ephox.katamari.api.Option', 'ephox.katamari.api.Fun' ], function (Option, Fun) {
  assertOptionEq(Option.some(6), Option.some(6).filter(function(x) { return x === 6; }));
  assertOptionEq(Option.none(), Option.some(5).filter(function(x) { return x === 8; }));
  assertOptionEq(Option.some(6), Option.some(6).filter(Fun.constant(true)));
  assertOptionEq(Option.none(), Option.some(5).filter(Fun.constant(false)));

  assertOptionEq(Option.none(), Option.none().filter(boom));
});


test('fold_test', [ 'ephox.katamari.api.Option', 'ephox.katamari.api.Fun' ], function (Option, Fun) {
  assert.eq('az', Option.some('a').fold(boom, function(x) { return x + 'z'; }));
  assert.eq('zz', Option.none().fold(function() { return 'zz'; }, boom));


  assert.eq('a', Option.some('a').fold(boom, Fun.identity));
  assert.eq('b', Option.none().fold(Fun.constant('b'), boom));

  assert.eq(['z'], Option.some('z').fold(boom, function () { return Array.prototype.slice.call(arguments); }));
  assert.eq([], Option.none().fold(function () { return Array.prototype.slice.call(arguments); }, boom));


});

test(
  'Options',

  [
    'ephox.katamari.api.Option'
  ],

  function (Option) {
    var arr = [Option.some(1), Option.none(), Option.some(2), Option.some(3), Option.none(), Option.none(), Option.none(), Option.none(), Option.some(4)];
    assert.eq([1, 2, 3, 4], Option.cat(arr));
  }
);

test('liftN', [ 'ephox.katamari.api.Option' ], function (Option) {


  var Person = function(name, age, address) {
    return {name:name, age:age, address:address};
  };

  assert.eq({name:'bob', age:25, address:"the moon"}, Option.liftN([Option.some("bob"), Option.some(25), Option.some("the moon")], Person).getOrDie());

  assert.eq(true, Option.liftN([Option.some("bob"), Option.none(), Option.some("the moon")], function() { throw "barf"; }).isNone());
  assert.eq(true, Option.liftN([Option.none(), Option.none(), Option.some("the moon")], function() { throw "barf"; }).isNone());
});