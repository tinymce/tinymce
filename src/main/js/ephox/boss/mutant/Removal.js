define(
  'ephox.boss.mutant.Removal',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.boss.mutant.Detach',
    'ephox.boss.mutant.Up',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
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

        var lefts = index > -1 ? parent.children.slice(0, index) : parent.children;
        var rights = index > -1 ? parent.children.slice(index + 1) : [];
        parent.children = lefts.concat(children).concat(rights);
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
