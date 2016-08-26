define(
  'ephox.alloy.test.TestStore',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'global!console'
  ],

  function (RawAssertions, Step, console) {
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

      var clear = function () {
        array = [ ];
      };

      var sAssertEq = function (label, expected) {
        return Step.sync(function () {
          // Can't use a normal step here, because we don't need to get array lazily
          return RawAssertions.assertEq(label, expected, array.slice(0));
        });
      };

      var assertEq = function (label, expected) {
        return RawAssertions.assertEq(label, expected, array.slice(0));
      };

      var sAssertSortedEq = function (label, expected) {
        return Step.sync(function () {
          // Can't use a normal step here, because we don't need to get array lazily
          return RawAssertions.assertEq(label, expected.slice(0).sort(), array.slice(0).sort());
        });
      };

      return {
        adder: adder,
        clear: clear,
        sClear: sClear,
        sAssertEq: sAssertEq,
        assertEq: assertEq,
        sAssertSortedEq: sAssertSortedEq
      };
    };
  }
);