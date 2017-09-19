define(
  'ephox.boss.mutant.Query',

  [
    'ephox.boss.mutant.Properties',
    'ephox.boss.mutant.Up',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option'
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
      return itemIndex.bind(function (iIndex) {
        return otherIndex.map(function (oIndex) {
          if (iIndex < oIndex) return 4;
          else return 2;
        });
      }).getOr(0);
    };

    var prevSibling = function (item) {
      var parent = Properties.parent(item);
      var kin = parent.map(Properties.children).getOr([]);
      var itemIndex = Arr.findIndex(kin, function (x) { return item.id === x.id; });
      return itemIndex.bind(function (iIndex) {
        return iIndex > 0 ? Option.some(kin[itemIndex - 1]) : Option.none();
      });
    };

    var nextSibling = function (item) {
      var parent = Properties.parent(item);
      var kin = parent.map(Properties.children).getOr([]);
      var itemIndex = Arr.findIndex(kin, function (x) { return item.id === x.id; });
      return itemIndex.bind(function (iIndex) {
        return iIndex < kin.length - 1 ? Option.some(kin[itemIndex + 1]) : Option.none();
      });
    };

    return {
      comparePosition: comparePosition,
      prevSibling: prevSibling,
      nextSibling: nextSibling
    };
  }
);
