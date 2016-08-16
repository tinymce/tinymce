test(
  'Options',

  [
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options'
  ],

  function (Option, Options) {
    var arr = [Option.some(1), Option.none(), Option.some(2), Option.some(3), Option.none(), Option.none(), Option.none(), Option.none(), Option.some(4)];
    assert.eq([1, 2, 3, 4], Options.cat(arr));
  }
);

test('liftN', [ 'ephox.katamari.api.Option', 'ephox.katamari.api.Options' ], function (Option, Options) {


  var Person = function(name, age, address) {
    return {name:name, age:age, address:address};
  };

  assert.eq({name:'bob', age:25, address:"the moon"}, Options.liftN([Option.some("bob"), Option.some(25), Option.some("the moon")], Person).getOrDie());

  assert.eq(true, Options.liftN([Option.some("bob"), Option.none(), Option.some("the moon")], function() { throw "barf"; }).isNone());
  assert.eq(true, Options.liftN([Option.none(), Option.none(), Option.some("the moon")], function() { throw "barf"; }).isNone());
});