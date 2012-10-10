define(
  'ephox.phoenix.split.Split',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.data.TextSplit',
    'ephox.phoenix.util.str.Split',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text'
  ],

  function (Option, TextSplit, Split, Element, Insert, InsertAll, Node, Text) {

    var tokens = function (element, ps) {
      var text = Text.get(element);
      return Split.split(text, ps);
    };

    var splitByPair = function (element, start, end) {
      if (start === end) return element;
      if (start > end) throw 'Invalid split operation. Value for start ('  + start + ') must be lower than end (' + end + ')';
      if (!Node.isText(element)) return element;

      var len = Text.get(element).length;
      var parts = tokens(element, [start, end]);

      if (start === 0 && end === len) return element;
      else if (start === 0) {
        Text.set(element, parts[1]);
        Insert.after(element, Element.fromText(parts[2]));
        return element;
      } else {
        Text.set(element, parts[0]);
        var middle = Element.fromText(parts[1]);
        var nodes = [middle].concat(parts[2] && parts[2].length > 0 ? [Element.fromText(parts[2])] : []);
        InsertAll.after(element, nodes);
        return middle;
      }
    };

    var split = function (element, position) {
      if (!Node.isText(element)) return TextSplit.bisect(Option.none(), Option.some(element));
      if (position === 0) return TextSplit.bisect(Option.none(), Option.some(element));
      if (position === Text.get(element).length) return TextSplit.bisect(Option.some(element), Option.none());

      var parts = tokens(element, [position]);
      Text.set(element, parts[0]);
      var after = Element.fromText(parts[1]);
      Insert.after(element, after);
      return TextSplit.bisect(Option.some(element), Option.some(after));
    };

    return {
      splitByPair: splitByPair,
      split: split
    };

  }
);
