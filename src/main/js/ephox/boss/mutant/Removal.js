define(
  'ephox.boss.mutant.Removal',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Arr, Option) {
    var unwrap = function (item) {
      // takes away this item and appends its children to its parent
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

    return {
      unwrap: unwrap
    };
  }
);
