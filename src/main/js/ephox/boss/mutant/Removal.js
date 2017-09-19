define(
  'ephox.boss.mutant.Removal',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.boss.mutant.Detach',
    'ephox.boss.mutant.Up',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option'
  ],

  function (Comparator, Detach, Up, Arr, Option) {
    var unwrap = function (item) {
      item.parent.each(function (parent) {
        var children = item.children;
        Arr.each(children, function (child) {
          child.parent = Option.some(parent);
        });

        var index = Arr.findIndex(parent.children, function (sibling) {
          return Comparator.eq(sibling, item);
        });

        index.fold(function () {
          parent.children = parent.children.concat(children);
        }, function (ind) {
          parent.children.slice(0, index).concat(children).concat(parent.children.slice(index + 1));
        });
      });
    };

    var remove = function (item) {
      detach(item);
    };

    var detach = function (item) {
      Detach.detach(Up.top(item), item);
    };

    return {
      unwrap: unwrap,
      remove: remove,
      detach: detach
    };
  }
);
