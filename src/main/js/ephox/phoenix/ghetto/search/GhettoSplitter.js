define(
  'ephox.phoenix.ghetto.search.GhettoSplitter',

  [
    'ephox.phoenix.data.Spot'
  ],

  function (Spot) {
    var split = function (universe, offset, a) {
      if (offset > a.start() && offset < a.finish()) {
        var newA = Spot.range(a.element(), a.start(), offset);
        var text = universe.property().getText(a.element());
        universe.property().setText(a.element(), text.substring(0, offset - a.start()));
        var firstSplit = universe.create().text(text.substring(offset - a.start()));
        universe.insert().after(a.element(), firstSplit);
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
