define(
  'ephox.robin.smartselect.Selection',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.gather.HackPaths',
    'ephox.robin.smartselect.EndofWord',
    'ephox.robin.smartselect.Prune',
    'ephox.robin.smartselect.Transform'
  ],

  function (Arr, Option, Spot, Gather, HackPaths, EndofWord, Prune, Transform) {
    var gather = function (universe, item) {
      var prune = Prune(universe);
      var transform = Transform(universe);
      // This needs to be more selective. I shouldn't have to gather both left and right every time.
      return Gather.gather(universe, item, prune, transform);
    };

    /* Given an initial position (item, offset), identify the optional selection range which represents the 
       word that (item, offset) is on. The start of the word and the end of the word is NOT considered
       on that word. Returns none if no word can be identified containing offset.
     */
    var word = function (universe, item, offset) {
      if (!universe.property().isText(item)) return Option.none();
      var defaultLeft = function (point) {
        return Spot.point(point.element(), point.offset().getOr(0));
      };

      var defaultRight = function (point) {
        var text = universe.property().getText(point.element());
        return Spot.point(point.element(), point.offset().getOr(text.length));
      };


      // This needs to be more selective. I shouldn't have to gather both left and right every time.
      var cluster = HackPaths.words(universe, item);
      return EndofWord.select(universe, item, offset, left, right);
    };

    return {
      word: word
    };
  }
);
