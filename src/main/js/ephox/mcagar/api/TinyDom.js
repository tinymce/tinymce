define(
  'ephox.mcagar.api.TinyDom',

  [
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.node.Element'
  ],

  function (Struct, Element) {
    var range = Struct.immutableBag([ 'start', 'soffset', 'finish', 'foffset' ], [ ]);

    var fromDom = function (elm) {
      return Element.fromDom(elm);
    };

    var fromRange = function (rng) {
      return range({
        start: rng.startContainer,
        soffset: rng.startOffset,
        finish: rng.endContainer,
        foffset: rng.endOffset
      });
    };

    return {
      fromDom: fromDom,
      fromRange: fromRange
    };
  }
);