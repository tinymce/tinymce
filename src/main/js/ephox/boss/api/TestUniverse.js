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
    'ephox.boss.mutant.Removal',
    'ephox.boss.mutant.Styling',
    'ephox.boss.mutant.Tracks',
    'ephox.boss.mutant.Up',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Creator, Down, Insertion, Locator, Logger, Properties, Removal, Styling, Tracks, Up, Fun, Option) {
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
          predicate: Up.predicate,
          all: Up.all,
          top: Up.top
        }),
        down: Fun.constant({
          selector: Down.selector
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
          prepend: Insertion.prepend,
          wrap: wrap
        }),
        remove: Fun.constant({
          unwrap: Removal.unwrap
        }),
        create: Fun.constant({
          nu: Creator.nu,
          clone: Creator.clone
        }),
        property: Fun.constant({
          children: Properties.children,
          name: Properties.name,
          parent: Properties.parent
        }),
        eq: Comparator.eq,
        find: find,
        get: get,
        shortlog: shortlog
      };
    };

  }
);
