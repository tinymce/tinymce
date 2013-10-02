define(
  'ephox.robin.smartselect.Selection',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.smartselect.EndofWord',
    'ephox.robin.smartselect.Prune',
    'ephox.robin.smartselect.Transform'
  ],

  function (Arr, Spot, Gather, EndofWord, Prune, Transform) {
    var gather = function (universe, item) {
      var prune = Prune(universe);
      var transform = Transform(universe);
      // This needs to be more selective. I shouldn't have to gather all directions every time.
      return Gather.gather(universe, item, prune, transform);
    };

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

      var gathered = gather(universe, item);
      var left = Arr.map(gathered.left(), defaultLeft);
      var right = Arr.map(gathered.right(), defaultRight);
      return EndofWord.select(universe, item, offset, left, right);
    };

    return {
      word: word
    };
  }
);
