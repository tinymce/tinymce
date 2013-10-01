define(
  'ephox.robin.smartselect.Selection',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.data.WordRange',
    'ephox.robin.smartselect.Prune',
    'ephox.robin.smartselect.Transform'
  ],

  function (Option, Spot, Gather, WordRange, Prune, Transform) {
    /* Break down the current item if necessary */
    var breakdown = function (item, offset) {
      // FIX: This is inefficient. I shouldn't have to do to gathering left/right process if the break exists in the starting node.
      
    };


    /* Given an initial position (item, offset), identify the selection range which represents the 
       word that (item, offset) is on
     */
    var current = function (universe, item, offset) {
      var prune = Prune(universe);
      var transform = Transform(universe);
      var gathered = Gather.gather(universe, item, prune, transform);

      var same = function () {
        return Spot.point(item, offset);
      };

      var start = Option.from(gathered.left()[0]).getOrThunk(same);

      var finish = Option.from(gathered.right()[gathered.right().length - 1]).getOrThunk(same);

      return WordRange(start.element(), start.offset(), finish.element(), finish.offset());
    };

    return {
      current: current
    };
  }
);
