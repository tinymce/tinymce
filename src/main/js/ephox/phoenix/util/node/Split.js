define(
  'ephox.phoenix.util.node.Split',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.util.str.Split',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Split, Struct, Element, Text) {

    var Single = Struct.immutable('newValue', 'after');
    var Double = Struct.immutable('newValue', 'split', 'extra');

    var tokens = function (element, ps) {
      var text = Text.get(element);
      return Split.split(text, ps);
    };

    var split = function (element, p) {
      var parts = tokens(element, [p]);
      var newValue = parts[0];
      var after = Element.fromText(parts.length > 1 ? parts[1] : '');
      return Single(newValue, after);
    };

    var splitByPair = function (element, p1, p2) {
      var parts = tokens(element, [p1, p2]);
      var newValue = parts[0];
      var split = Element.fromText(parts[1]);
      var extra = Arr.map(parts.slice(2), Element.fromText);
      return Double(newValue, split, extra);
    };

    return {
      split: split,
      splitByPair: splitByPair
    };
  }
);
