define(
  'ephox.boss.mutant.Query',

  [
    'ephox.boss.mutant.Properties',
    'ephox.boss.mutant.Up',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Properties, Up, Arr, Option) {
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

    var prevSibling = function (item) {
      var parent = Properties.parent(item);
      var kin = parent.map(Properties.children).getOr([]);
      var itemIndex = Arr.findIndex(kin, function (x) { return item.id === x.id; });
      if (itemIndex > 0) return Option.some(kin[itemIndex - 1]);
      else return Option.none();
    };

    var nextSibling = function (item) {
      var parent = Properties.parent(item);
      var kin = parent.map(Properties.children).getOr([]);
      var itemIndex = Arr.findIndex(kin, function (x) { return item.id === x.id; });
      if (itemIndex < kin.length - 1) return Option.some(kin[itemIndex + 1]);
      else return Option.none();
    };

    return {
      comparePosition: comparePosition,
      prevSibling: prevSibling,
      nextSibling: nextSibling
    };
  }
);
