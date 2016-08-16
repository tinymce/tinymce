test('Augment',

  [
    'ephox.katamari.api.Augment',
    'ephox.katamari.api.Arr'
  ],

  function(Augment, Arr) {

    var check = function(base, extras, expected) {
      assert.eq(undefined, Augment.augment(base, extras));
      assert.eq(expected, base);
    };

    check({}, {}, {});

    var inputs=[null, undefined, "", [], {}, [0], [null], [undefined], (function(){}), -2, -1, 0, 1, 2, 99, 3.14, "cat", "z", "-1", "0", "1", "NaN", "null", "undefined", (function(){throw 'fit';}), Math.E, Math.PI, Math.random, Math.random()];

    //1 variable
    Arr.each(inputs, function(x) {

      //left identity
      check({a:x}, {}, {a:x});

      //right identity
      check({}, {a:x}, {a:x});

      //overwrite with same
      check({a:x}, {a:x}, {a:x});
    });

    // 2 distinct variables
    Arr.each(inputs, function(x) { Arr.each(inputs, function(y) { if (x !== y) {

      //left identity
      check({a:x,z:y}, {}, {a:x,z:y});

      //right identity
      check({}, {a:x,b:y}, {a:x,b:y});

      //overwrite with different
      check({a:x}, {a:y}, {a:y});

      //merge
      check({a:x}, {b:y}, {a:x,b:y});
    }})});
  }
);