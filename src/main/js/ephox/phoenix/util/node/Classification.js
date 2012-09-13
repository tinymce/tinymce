define(
  'ephox.phoenix.util.node.Classification',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Node'
  ],

  function (Arr, Css, Node) {

    var isBoundary = function (element) {
      if (!Node.isElement(element)) return false;
      var display = Css.get(element, 'display');
      return Arr.contains(['block', 'table-cell', 'table-row', 'table', 'list-item'], display);
    };

    var isEmpty = function (element) {
      if (!Node.isElement(element)) return false;
      return Arr.contains(['br', 'img'], Node.name(element));
    };

    return {
      isBoundary: isBoundary,
      isEmpty: isEmpty
    };
  }
);
