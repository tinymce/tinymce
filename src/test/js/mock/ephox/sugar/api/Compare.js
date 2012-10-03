define(
  'ephox.sugar.api.Compare',

  [
  ],

  function () {

    var eq = function (a, b) {
      return a === b;
    };

    return {
      eq: eq
    };
  }
);
