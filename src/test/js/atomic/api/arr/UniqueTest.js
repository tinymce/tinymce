test('Unique',

  [
    'ephox.katamari.api.Unique'
  ],

  function(Unique) {

    var expected = ["three", "two", "one"];

    var check = function(input) {
      assert.eq(expected, Unique.stringArray(input));
    };

    check(["three", "two", "one"]);
    check(["three", "three", "two", "one"]);
    check(["three", "three", "two", "two", "one"]);
    check(["three", "three", "two", "two", "one", "one"]);
    check(["three", "three", "two", "two", "one", "one", "three"]);
    check(["three", "three", "two", "two", "one", "one", "three", "two"]);
    check(["three", "three", "two", "two", "one", "one", "three", "two", "one"]);
  }
);