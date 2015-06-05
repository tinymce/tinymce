define(
  'ephox.snooker.api.TableContent',

  [
    'ephox.compass.Arr',
    'ephox.oath.navigation.Descend',
    'ephox.robin.api.dom.DomStructure',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Descend, DomStructure, Compare, Element, InsertAll, Node, Remove, Traverse) {
    var merge = function (cells) {
      var isBr = function (el) {
        return Node.name(el) === 'br';
      };

      var markCell = function (cell) {
        return Descend.lastCursor(cell).bind(function (rightEdge) {
          return Traverse.parent(rightEdge).map(function (parent) {
            return DomStructure.isBlock(parent) && !Compare.eq(cell, parent) ? [] :  [ Element.fromTag('br') ];
          });
        }).getOr([]);
      };

      var markContent = function () {
        var kin = Arr.bind(cells, function (cell) {
          var children = Traverse.children(cell);
          // When the last element within the cell is an inline element, we mark it by adding a <br> to the end of its children.
          return children.length > 1 || (children.length == 1 && !isBr(children[0])) ? children.concat(markCell(cell)) : [];
        });

        return kin;
      };

      var contents = markContent();
      Remove.empty(cells[0]);
      InsertAll.append(cells[0], contents);
    };

    return {
      merge: merge
    };
  }
);