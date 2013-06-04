define(
  'ephox.boss.mutant.Insertion',

  [
    'ephox.boss.mutant.Detach',
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Up',
    'ephox.perhaps.Option'
  ],

  function (Detach, Locator, Up, Option) {

    var before = function (anchor, item) {
      anchor.parent.each(function (parent) {
        var index = Locator.indexIn(parent, anchor);

        var detached = Detach.detach(Up.top(item), item.id).getOr(item);
        detached.parent = Option.some(parent);
        if (index > -1) parent.children = parent.children.slice(0, index).concat([detached]).concat(parent.children.slice(index));
      });
    };

    var after = function (anchor, item) {
      anchor.parent.each(function (parent) {
        var index = Locator.indexIn(parent, anchor);

        var detached = Detach.detach(Up.top(item), item.id).getOr(item);
        detached.parent = Option.some(parent);
        if (index > -1) parent.children = parent.children.slice(0, index + 1).concat([detached]).concat(parent.children.slice(index + 1));
      });

    };

    var append = function (parent, item) {

    };

    var appendAll = function (parent, items) {

    };

    var prepend = function (parent, item) {

    };

    var wrap = function (anchor, wrapper) {

    };

    return {
      before: before,
      after: after,
      append: append,
      appendAll: appendAll,
      prepend: prepend,
      wrap: wrap
    };
  }
);
