define(
  'ephox.phoenix.search.Splitter',

  [
    'ephox.phoenix.data.Spot',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Text'
  ],

  function (Spot, Element, Insert, Text) {

    var split = function (offset, a) {
      if (offset > a.start() && offset < a.finish()) {
        var newA = Spot.range(a.element(), a.start(), offset);
        var text = Text.get(a.element());
        Text.set(a.element(), text.substring(0, offset - a.start()));
        var firstSplit = Element.fromText(text.substring(offset - a.start()));
        Insert.after(a.element(), firstSplit);
        return [newA, Spot.range(firstSplit, offset, a.finish())];
      } else {
        return [a];
      }
    };

    return {
      split: split
    };
  }
);
