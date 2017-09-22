define(
  'ephox.darwin.selection.Util',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.selection.Situ',
    'ephox.sugar.selection.core.SelectionDirection'
  ],

  function (Fun, Situ, SelectionDirection) {

    var convertToRange = function (win, selection) {
      // TODO: Use API packages of sugar
      var rng = SelectionDirection.asLtrRange(win, selection);
      return {
        start: Fun.constant(rng.startContainer),
        soffset: Fun.constant(rng.startOffset),
        finish: Fun.constant(rng.endContainer),
        foffset: Fun.constant(rng.endOffset)
      };
    };

    var makeSitus = function (start, soffset, finish, foffset) {
      return {
        start: Fun.constant(Situ.on(start, soffset)),
        finish: Fun.constant(Situ.on(finish, foffset))
      };
    };

    return {
      convertToRange: convertToRange,
      makeSitus: makeSitus
    };
  }
);
