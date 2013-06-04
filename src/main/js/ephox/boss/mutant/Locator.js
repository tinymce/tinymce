define(
  'ephox.boss.mutant.Locator',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Arr, Fun, Option) {
    var byId = function (item, id) {
      if (id === undefined) throw 'Id value not specified for byId: ' + id;
      if (item.id !== undefined && item.id === id) {
        return Option.some(item);
      } else {
        return Arr.foldl(item.children || [], function (b, a) {
          return byId(a, id).or(b);
        }, Option.none());
      }
    };

    var index = function (item) {
      return item.parent.fold(Fun.constant(-1), function (parent) {
        return indexIn(parent, item);
      });
    };

    var indexIn = function (parent, item) {
      return Arr.findIndex(parent.children, function (x) {
        return Comparator.eq(x, item);
      });
    };

    return {
      byId: byId,
      index: index,
      indexIn: indexIn
    };
  }
);
