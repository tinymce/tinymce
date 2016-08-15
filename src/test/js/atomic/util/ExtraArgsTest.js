test(
  'ExtraArgsTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.util.ExtraArgs',
    'global!Array'
  ],

  function (RawAssertions, ExtraArgs, Array) {
    var toArray = function () {
      return Array.prototype.slice.call(arguments, 0);
    };

    var check = function (label, expected, extra) {
      var actual = ExtraArgs.augment(toArray, extra)();
      RawAssertions.assertEq(label, expected, actual);
    };

    var lazy10 = function () { return 10; };
    var eager10 = 10;

    check(
      'No extra arguments',
      [ ],
      [ ]
    );

    check(
      '1 extra argument: eager',
      [ 10 ],
      [ ExtraArgs.eager(eager10) ]
    );

    check(
      '1 extra argument: lazy',
      [ 10 ],
      [ ExtraArgs.lazy(lazy10) ]
    );

    check(
      '2 extra arguments: lazy and eager',
      [ 'cat', 'dog' ],
      [
        ExtraArgs.lazy(function () { return 'cat'; }),
        ExtraArgs.eager('dog')
      ]
    );

    check(
      'Multiple arguments',
      [ 'one', 'two', 'three' ],
      [
        ExtraArgs.eager('one'),
        ExtraArgs.eager('two'),
        ExtraArgs.lazy(function () { return 'three' })
      ]
    );
  }
);