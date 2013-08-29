define(
  'ephox.phoenix.split.Split',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.TextSplit',
    'ephox.polaris.api.Strings'
  ],

  function (Option, TextSplit, Strings) {
    var tokens = function (universe, item, ps) {
      var text = universe.property().getText(item);
      return Strings.splits(text, ps);
    };

    /**
     * Return a TextSplit of item split at position.
     *
     * Edge cases:
     *   pos at start:      (none, some(item))
     *   pos at end:        (some(item), none)
     *   item is not text:  (none, some(item))
     */
    var split = function (universe, item, position) {
      if (!universe.property().isText(item)) return TextSplit(Option.none(), Option.some(item));
      if (position === 0) return TextSplit(Option.none(), Option.some(item));
      if (position === universe.property().getText(item).length) return TextSplit(Option.some(item), Option.none());

      var parts = tokens(universe, item, [position]);
      universe.property().setText(item, parts[0]);
      var after = universe.create().text(parts[1]);
      universe.insert().after(item, after);
      return TextSplit(Option.some(item), Option.some(after));
    };

    /**
     * Split an item into three parts, and return the middle.
     *
     * If no split is required, return the item.
     */
    var splitByPair = function (universe, item, start, end) {
      if (!universe.property().isText(item) || start === end) return item;
      if (start > end) return splitByPair(universe, item, end, start);

      var len = universe.property().getText(item).length;
      if (start === 0 && end === len) return item;

      var parts = tokens(universe, item, [start, end]);
      if (start === 0) {
        // No before, so item becomes the "middle" and is returned.
        universe.property().setText(item, parts[1]);
        universe.insert().after(item, universe.create().text(parts[2]));
        return item;
      } else {
        universe.property().setText(item, parts[0]);
        var middle = universe.create().text(parts[1]);

        var part3 = parts[2] && parts[2].length > 0 ? [universe.create().text(parts[2])] : [];

        var nodes = [middle].concat(part3);

        universe.insert().afterAll(item, nodes);
        return middle;
      }
    };

    return {
      split: split,
      splitByPair: splitByPair
    };
  }
);

