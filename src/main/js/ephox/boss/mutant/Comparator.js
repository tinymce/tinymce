define(
  'ephox.boss.mutant.Comparator',

  [
  ],

  function () {
    var eq = function (a, b) {
      return a.id === undefined && b.id === undefined ? a.name === b.name : a.id === b.id;
    };

    return {
      eq: eq
    };
  }
);
