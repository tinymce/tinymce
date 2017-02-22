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

    // TODO: Standardise the things that can take a cursor position.
    var emptyTags = [ 'img', 'br' ];

    var isCursorPosition = function (elem) {
      var isText = Node.isText(elem) && Text.get(elem).length;
      return isText || Arr.contains(emptyTags, Node.name(elem));
    };

    return {
      getEnd: getEnd,
      isEnd: isEnd,
      isStart: isStart,
      isCursorPosition: isCursorPosition
    };
  }
);
