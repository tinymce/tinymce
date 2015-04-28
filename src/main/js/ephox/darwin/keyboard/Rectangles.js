define(
  'ephox.darwin.keyboard.Rectangles',

  [
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Node'
  ],

  function (WindowSelection, Awareness, Option, Node) {
    var getTextBox = function (win, element, offset) {
      console.log('offset:' ,offset);
      if (offset >= 0 && offset < Awareness.getEnd(element)) return WindowSelection.rectangleAt(win, element, offset, element, offset + 1);
      else if (offset > 0) return WindowSelection.rectangleAt(win, element, offset - 1, element, offset);
      return Option.none();
    };

    var getBox = function (win, element, offset) {
      var answer = (function () {
        if (Node.isElement(element)) return Option.some(element.dom().getBoundingClientRect());
        else if (Node.isText(element)) return getTextBox(win, element, offset);
        else return Option.none();
      })();
      answer.each(function (ans) {
        console.log('***************');
        console.log('element', element.dom(), 'offset', offset, 'answer', ans);
      });

      return answer;
    };

    return {
      getBox: getBox
    };
  }
);