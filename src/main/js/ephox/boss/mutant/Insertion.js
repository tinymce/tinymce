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

        var detached = Detach.detach(Up.top(anchor), item).getOr(item);
        detached.parent = Option.some(parent);
        if (index > -1) parent.children = parent.children.slice(0, index).concat([detached]).concat(parent.children.slice(index));
      });
    };

    var after = function (anchor, item) {
      anchor.parent.each(function (parent) {
        var index = Locator.indexIn(parent, anchor);

        var detached = Detach.detach(Up.top(anchor), item).getOr(item);
        detached.parent = Option.some(parent);
        if (index > -1) parent.children = parent.children.slice(0, index + 1).concat([detached]).concat(parent.children.slice(index + 1));
      });
    };

    var append = function (parent, item) {
      var detached = Detach.detach(Up.top(parent), item).getOr(item);
      parent.children = parent.children || [];
      parent.children = parent.children.concat([ detached ]);
      detached.parent = Option.some(parent);
    };

    var appendAll = function (parent, items) {
      Arr.map(items, function (item) {
        append(parent, item);
      });
    };

    var afterAll = function (anchor, items) {
      anchor.parent.each(function (parent) {
        var index = Locator.indexIn(parent, anchor);

        var detached = Arr.map(items, function (item) {
          var ditem = Detach.detach(Up.top(anchor), item).getOr(item);
          ditem.parent = Option.some(parent);
          return ditem;
        });
        if (index > -1) parent.children = parent.children.slice(0, index + 1).concat(detached).concat(parent.children.slice(index + 1));
      });
    };

    var prepend = function (parent, item) {
      var detached = Detach.detach(Up.top(parent), item).getOr(item);
      parent.children = parent.children || [];
      parent.children = [detached].concat(parent.children);
      detached.parent = Option.some(parent);
    };

    var wrap = function (anchor, wrapper) {
      // INVESTIGATE: At this stage, mutation is necessary to act like the DOM
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
      afterAll: afterAll,
      append: append,
      appendAll: appendAll,
      prepend: prepend,
      wrap: wrap
    };
  }
);
