define(
  'ephox.boss.api.TestUniverse',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.boss.mutant.Creator',
    'ephox.boss.mutant.Down',
    'ephox.boss.mutant.Insertion',
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Logger',
    'ephox.boss.mutant.Properties',
    'ephox.boss.mutant.Query',
    'ephox.boss.mutant.Removal',
    'ephox.boss.mutant.Styling',
    'ephox.boss.mutant.Tracks',
    'ephox.boss.mutant.Up',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Creator, Down, Insertion, Locator, Logger, Properties, Query, Removal, Styling, Tracks, Up, Fun, Option) {
    return function (raw) {
      var content = Tracks.track(raw, Option.none());

      // NOTE: The top point might change when we are wrapping.
      var wrap = function (anchor, wrapper) {
        Insertion.wrap(anchor, wrapper);
        content.parent.fold(Fun.noop, function (p) {
          content = p;
        });
      };

      var find = function (root, id) {
        return Locator.byId(root, id);
      };

      var get = function () {
        return content;
      };

      var shortlog = function (f) {
        return f !== undefined ? Logger.custom(content, f) : Logger.basic(content);
      };

      return {
        up: Fun.constant({
          selector: Up.selector,
          closest: Up.closest,
          predicate: Up.predicate,
          all: Up.all,
          top: Up.top
        }),
        down: Fun.constant({
          selector: Down.selector,
          predicate: Down.predicate
        }),
        styles: Fun.constant({
          get: Styling.get,
          set: Styling.set,
          remove: Styling.remove
        }),
        insert: Fun.constant({
          before: Insertion.before,
          after: Insertion.after,
          append: Insertion.append,
          appendAll: Insertion.appendAll,
          afterAll: Insertion.afterAll,
          prepend: Insertion.prepend,
          wrap: wrap
        }),
        remove: Fun.constant({
          unwrap: Removal.unwrap,
          detach: Removal.detach,
          remove: Removal.remove
        }),
        create: Fun.constant({
          nu: Creator.nu,
          text: Creator.text,
          clone: Creator.clone
        }),
        query: Fun.constant({
          comparePosition: Query.comparePosition,
          nextSibling: Query.nextSibling,
          prevSibling: Query.prevSibling
        }),
        property: Fun.constant({
          children: Properties.children,
          name: Properties.name,
          parent: Properties.parent,
          isText: Properties.isText,
          isElement: Properties.isElement,
          setText: Properties.setText,
          getText: Properties.getText,
          isEmptyTag: Properties.isEmptyTag,
          isBoundary: Properties.isBoundary
        }),
        eq: Comparator.eq,
        is: Comparator.is,
        find: find,
        get: get,
        shortlog: shortlog
      };
    };

  }
);
