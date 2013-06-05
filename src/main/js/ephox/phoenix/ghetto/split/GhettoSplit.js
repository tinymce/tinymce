define(
  'ephox.phoenix.ghetto.split.GhettoSplit',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.data.TextSplit',
    'ephox.phoenix.util.str.Split'
  ],

  function (Option, TextSplit, Split) {
    var tokens = function (universe, item, ps) {
      var text = universe.property().getText(item);
      return Split.split(text, ps);
    };

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

    var splitByPair = function (universe, item, start, end) {
      if (start === end) return item;
      if (start > end) throw 'Invalid split operation. Value for start ('  + start + ') must be lower than end (' + end + ')';
      if (!universe.property().isText(item)) return item;

      var len = universe.property().getText(item).length;
      var parts = tokens(universe, item, [start, end]);

      if (start === 0 && end === len) return item;
      else if (start === 0) {
        universe.property().setText(item, parts[1]);
        universe.insert().after(item, universe.create().text(parts[2]));
        return item;
      } else {
        universe.property().setText(item, parts[0]);
        var middle = universe.create().text(parts[1]);
        var nodes = [middle].concat(parts[2] && parts[2].length > 0 ? [universe.create().text(parts[2])] : []);
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

