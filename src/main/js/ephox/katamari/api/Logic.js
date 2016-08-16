define(
  'ephox.katamari.api.Logic',

  [

  ],

  function () {

    /** Logical implication - lazy in second argument. */
    var implies = function(a, b) {
      return !a || b();
    };

    /** Logical implication - strict in both arguments. */
    var impliesStrict = function(a, b) {
      return !a || b;
    };

    return {
      implies: implies,
      impliesStrict: impliesStrict
    };
  }
);
