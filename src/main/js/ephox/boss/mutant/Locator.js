define(
  'ephox.boss.mutant.Locator',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.boss.mutant.Creator',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Creator, Arr, Fun, Option) {
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

    var byItem = function (item, target) {
      var itemNu = Creator.isNu(item);
      var targetNu = Creator.isNu(target);
      var sameId = item.id !== undefined && item.id === target.id;
      if (sameId && !itemNu && !targetNu) {
        return Option.some(item);
      } else if (sameId && itemNu && targetNu && item.random === target.random) {
        return Option.some(item);
      } else {
        return Arr.foldl(item.children || [], function (b, a) {
          return byItem(a, target).or(b);
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
      byItem: byItem,
      index: index,
      indexIn: indexIn
    };
  }
);
