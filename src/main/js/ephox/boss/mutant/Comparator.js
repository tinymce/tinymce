define(
  'ephox.boss.mutant.Comparator',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var eq = function (a, b) {
      return a.id === undefined && b.id === undefined ? a.name === b.name : a.id === b.id;
    };

    /* Obviously, we can't support full selector syntax ... so let's just split by comma and use as array to compare with name */
    var is = function (item, selector) {
      var matches = selector.split(',');
      return Arr.contains(matches, item.name);
    };

    return {
      eq: eq,
      is: is
    };
  }
);
