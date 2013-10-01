define(
  'ephox.robin.smartselect.Selection',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.data.WordRange',
    'ephox.robin.smartselect.Prune',
    'ephox.robin.smartselect.Transform',
    'ephox.robin.util.WordUtil'
  ],

  function (Arr, Fun, Option, Spot, Gather, WordRange, Prune, Transform, WordUtil) {
    /* Given an initial position (item, offset), identify the selection range which represents the 
       word that (item, offset) is on
     */
    var word = function (universe, item, offset) {
      var defaultLeft = function (point) {
        return Spot.point(point.element(), point.offset().getOr(0));
      };

      var defaultRight = function (point) {
        var text = universe.property().getText(point.element());
        return Spot.point(point.element(), point.offset().getOr(text.length));
      };

      // ASSUMPTION: item is a text node. Probably an invalid assumption. Clean this up.
      var text = universe.property().getText(item);
      var parts = WordUtil.around(text, offset);

      var prune = Prune(universe);
      var transform = Transform(universe);

      var same = function () {
        return Spot.point(item, offset);
      };

      // This needs to be more selective. I shouldn't have to gather all directions every time.
      var gathered = Gather.gather(universe, item, prune, transform);

      var start = parts.before().fold(function () {
        return Option.from(gathered.left()[0]).map(defaultLeft).getOrThunk(function () {
          return Spot.point(item, 0);
        });
      }, function (index) {
        return Spot.point(item, index);
      });

      var finish = parts.after().fold(function () {
        var right = gathered.right();
        return Option.from(right[right.length - 1]).map(defaultRight).getOrThunk(function () {
          return Spot.point(item, text.length);
        });
      }, function (index) {
        return Spot.point(item, index);
      });

      return WordRange(start.element(), start.offset(), finish.element(), finish.offset());
    };

    return {
      word: word
    };
  }
);
