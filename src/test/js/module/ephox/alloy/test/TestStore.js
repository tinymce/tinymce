define(
  'ephox.alloy.test.TestStore',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'global!console'
  ],

  function (Assertions, Step, console) {
    return function () {
      var array = [ ];
      var adder = function (value) {
        return function () {            
          array.push(value);
          console.log('store.add', value, array);
        };
      };

      var sClear = Step.sync(function () {
        array = [ ];
      });

      var sAssertEq = function (label, expected) {
        return Step.sync(function () {
          // Can't use a normal step here, because we don't need to get array lazily
          return Assertions.assertEq(label, expected, array.slice(0));
        });
      };

      var sAssertSortedEq = function (label, expected) {
        return Step.sync(function () {
          // Can't use a normal step here, because we don't need to get array lazily
          return Assertions.assertEq(label, expected.slice(0).sort(), array.slice(0).sort());
        });
      };

      return {
        adder: adder,
        sClear: sClear,
        sAssertEq: sAssertEq,
        sAssertSortedEq: sAssertSortedEq
      };
    };
  }
);