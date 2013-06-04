define(
  'ephox.boss.fake.Universe',

  [
    'ephox.boss.mutant.Comparator',
    'ephox.boss.mutant.Creator',
    'ephox.boss.mutant.Down',
    'ephox.boss.mutant.Insertion',
    'ephox.boss.mutant.Properties',
    'ephox.boss.mutant.Removal',
    'ephox.boss.mutant.Styling',
    'ephox.boss.mutant.Tracks',
    'ephox.boss.mutant.Up',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Comparator, Creator, Down, Insertion, Properties, Removal, Styling, Tracks, Up, Fun, Option) {
    return function (raw) {
      var content = Tracks.track(raw, Option.none());

      // The top point might change when we are wrapping.
      var wrap = function (anchor, wrapper) {
        Insertion.wrap(anchor, wrapper);
        content.parent.fold(Fun.noop, function (p) {
          content = p;
        });
      };

      var get = function () {
        return content;
      };

      return {
        up: {
          selector: Up.selector,
          predicate: Up.predicate,
          all: Up.all,
          top: Up.top
        },
        down: {
          selector: Down.selector
        },
        styles: {
        get: Styling.get,
          set: Styling.set,
          remove: Styling.remove
        },
        insert: {
          before: Insertion.before,
          after: Insertion.after,
          append: Insertion.append,
          appendAll: Insertion.appendAll,
          prepend: Insertion.prepend,
          wrap: wrap
        },
        remove: {
          unwrap: Removal.unwrap
        },
        create: {
          nu: Creator.nu
        },
        property: {
          children: Properties.children,
          name: Properties.name,
          parent: Properties.parent
        },
        eq: Comparator.eq,
        get: get
      };
    };

  }
);
