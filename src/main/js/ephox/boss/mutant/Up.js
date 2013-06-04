define(
  'ephox.boss.mutant.Up',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Arr, Option) {
    /* Obviously, we can't support full selector syntax ... so let's just split by comma and use as array to compare with name */
    var selector = function (item, query) {
      var matches = query.split(',');
      return item.parent.bind(function (parent) {
        return  Arr.contains(matches, parent.name) ? Option.some(parent) : selector(parent, query);
      });
    };

    var predicate = function (item, f) {
      return item.parent.bind(function (parent) {
        return f(parent) ? Option.some(parent) : predicate(parent, f);
      });
    };

    return {
      selector: selector,
      predicate: predicate
    };
  }
);
