test(
  'ReverseTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Jsc) {

    Jsc.property("Reversing twice is identity", "[nat]", function(a) {
      return Jsc.eq(a, Arr.reverse(Arr.reverse(a)));
    });

    Jsc.property("Reverse lists of 1 element", "nat", function(a) {
      return Jsc.eq([a], Arr.reverse([a]));
    });

    Jsc.property("Reverse lists of 2 elements", "nat", "string", function(a, b) {
      return Jsc.eq([b, a], Arr.reverse([a, b]));
    });

    Jsc.property("Reverse lists of 3 elements", "bool", "nat", "string", function(a, b, c) {
      return Jsc.eq([c, b, a], Arr.reverse([a, b, c]));
    });


    var check = function (expected, input) {
      var actual = Arr.reverse(input);
      assert.eq(expected, actual);
    };


    check([], []);
    check([1], [1]);
    check([1, 2], [2, 1]);
    check([2, 1], [1, 2]);
    check([1, 4, 5, 3, 2], [2, 3, 5, 4, 1]);
  }
);
