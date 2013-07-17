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

    var predicate = function (item, pred) {
      return Arr.bind(item.children || [], function (child) {
        var rest = predicate(child, pred);
        return pred(child) ? [ child ].concat(rest) : rest;
      });
    };

    return {
      selector: selector,
      predicate: predicate
    };
  }
);
