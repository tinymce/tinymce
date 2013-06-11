define(
  'ephox.boss.mutant.Detach',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.boss.mutant.Locator',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Locator, Arr, Option) {
    var detach = function (root, target) {
      return Locator.byItem(root, target).bind(function (item) {
        return item.parent.bind(function (parent) {
          var index = Arr.findIndex(parent.children || [], function (child) {
            return Comparator.eq(child, item);
          });

          if (index > -1) {
            parent.children = parent.children.slice(0, index).concat(parent.children.slice(index + 1));
            return Option.some(item);
          } else {
            return Option.none();
          }
        });
      });
    };

    return {
      detach: detach
    };
  }
);
