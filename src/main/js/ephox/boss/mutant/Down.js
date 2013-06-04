define(
  'ephox.boss.mutant.Down',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var selector = function (item, query) {
      var matches = query.split(',');
      return Arr.bind(item.children || [], function (child) {
        var rest = selector(child, query);
        return Arr.contains(matches, child.name) ? [ child ].concat(rest) : rest;
      });
    };

    return {
      selector: selector
    };
  }
);
