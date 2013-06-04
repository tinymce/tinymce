define(
  'ephox.boss.mutant.Locator',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Arr, Option) {
    var byId = function (item, id) {
      if (item.id !== undefined && item.id === id) {
        return Option.some(item);
      } else {
        return Arr.foldl(item.children || [], function (b, a) {
          return byId(a, id).or(b);
        }, Option.none());
      }
    };

    return {
      byId: byId
    };
  }
);
