define(
  'ephox.boss.mutant.Insertion',

  [
    'ephox.boss.mutant.Detach',
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Up',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Detach, Locator, Up, Arr, Option) {
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
      var detached = Detach.detach(Up.top(item), item.id).getOr(item);
      parent.children = parent.children || [];
      parent.children = parent.children.concat([ detached ]);
      detached.parent = Option.some(parent);
    };

    var appendAll = function (parent, items) {
      Arr.map(items, function (item) {
        append(parent, item);
      });
    };

    var prepend = function (parent, item) {
      var detached = Detach.detach(Up.top(item), item.id).getOr(item);
      parent.children = parent.children || [];
      parent.children = [detached].concat(parent.children);
      detached.parent = Option.some(parent);
    };

    var wrap = function (anchor, wrapper) {
      // Groan. Mutate this for the time being to see if this concept is even useful
      anchor.parent.each(function (parent) {
        wrapper.parent = Option.some(parent);
        parent.children = Arr.map(parent.children || [], function (c) {
          return c === anchor ? wrapper : c;
        });
        wrapper.children = [ anchor ];
        anchor.parent = Option.some(wrapper);
      });
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
