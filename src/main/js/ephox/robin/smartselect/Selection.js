define(
  'ephox.robin.smartselect.Selection',

  [
    'ephox.robin.data.WordRange'
  ],

  function (WordRange) {
    /* Given an initial position (item, offset), identify the selection range which represents the 
       word that (item, offset) is on
     */
    var current = function (universe, item, offset) {
      return WordRange(item, offset, item, offset);
    };

    return {
      current: current
    };
  }
);
