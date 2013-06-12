define(
  'ephox.boss.mutant.Query',

  [
    'ephox.boss.mutant.Up',
    'ephox.compass.Arr'
  ],

  function (Up, Arr) {
    var extract = function (item) {
      var self = item.id;
      var rest = item.children && item.children.length > 0 ? Arr.bind(item.children, extract) : [];
      return [ self ].concat(rest);
    };

    var comparePosition = function (item, other) {
      // horribly inefficient
      var top = Up.top(item);
      var all = extract(top);

      var itemIndex = Arr.findIndex(all, function (x) { return item.id === x; });
      var otherIndex = Arr.findIndex(all, function (x) { return other.id === x; });
      if (itemIndex > -1 && otherIndex > -1) {
        if (itemIndex < otherIndex) return 2;
        else return 4;
      }
      return 0;
    };

    return {
      comparePosition: comparePosition
    };
  }
);
