define(
  'ephox.sugar.api.selection.Awareness',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Arr, Node, Text, Traverse) {
    var getEnd = function (element) {
      return Node.name(element) === 'img' ? 1 : Text.getOption(element).fold(function () {
        return Traverse.children(element).length;
      }, function (v) {
        return v.length;
      });
    };

    var isEnd = function (element, offset) {
      return getEnd(element) === offset;
    };

    var isStart = function (element, offset) {
      return offset === 0;
    };

    var NBSP = '\u00A0';

    var isTextNodeWithCursorPosition = function (el) {
      return Text.getOption(el).filter(function (text) {
        // For the purposes of finding cursor positions only allow text nodes with content,
        // but trim removes &nbsp; and that's allowed
        return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
      }).isSome();
    };

    var elementsWithCursorPosition = [ 'img', 'br' ];
    var isCursorPosition = function (elem) {
      var hasCursorPosition = isTextNodeWithCursorPosition(elem);
      return hasCursorPosition || Arr.contains(elementsWithCursorPosition, Node.name(elem));
    };

    return {
      getEnd: getEnd,
      isEnd: isEnd,
      isStart: isStart,
      isCursorPosition: isCursorPosition
    };
  }
);
