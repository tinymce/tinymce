define(
  'ephox.darwin.keyboard.Rectangles',

  [
    'ephox.oath.proximity.Awareness',
    'ephox.sugar.api.Node',
    'global!document'
  ],

  function (Awareness, Node, document) {
    var getBox = function (window, element, offset) {
      if (Node.isElement(element)) return element.dom().getBoundingClientRect();
      else {
        if (offset === 0 && offset < Awareness.getEnd(element)) {
          var rng = document.createRange();
          rng.setStart(element.dom(), offset);
          rng.setEnd(element.dom(), offset + 1);
          return rng.getBoundingClientRect();
        } else if (offset > 1) {
          var rng2 = document.createRange();
          rng2.setStart(element.dom(), offset - 1);
          rng2.setEnd(element.dom(), offset);
          return rng2.getBoundingClientRect();
        } else {
          throw 'cattle';
        }
      }
    };

    return {
      getBox: getBox
    };
  }
);