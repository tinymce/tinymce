define(
  'ephox.snooker.api.TableContent',

  [
    'ephox.katamari.api.Arr',
    'ephox.robin.api.dom.DomStructure',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.CursorPosition'
  ],

  function (Arr, DomStructure, Compare, InsertAll, Remove, Element, Node, Text, PredicateFind, Traverse, CursorPosition) {
    var merge = function (cells) {
      var isBr = function (el) {
        return Node.name(el) === 'br';
      };

      var advancedBr = function (children) {
        return Arr.forall(children, function (c) {
          return isBr(c) || (Node.isText(c) && Text.get(c).trim().length === 0);
        });
      };

      var isListItem = function (el) {
        return Node.name(el) === 'li' || PredicateFind.ancestor(el, DomStructure.isList).isSome();
      };

      var siblingIsBlock = function (el) {
        return Traverse.nextSibling(el).each(function (rightSibling) {
          if (DomStructure.isBlock(rightSibling)) return true;
          if (DomStructure.isEmptyTag(rightSibling)) {
            return Node.name(rightSibling) === 'img' ? false : true;
          }
        }).getOr(false);
      };

      var markCell = function (cell) {
        return CursorPosition.last(cell).bind(function (rightEdge) {
          var rightSiblingIsBlock = siblingIsBlock(rightEdge);
          return Traverse.parent(rightEdge).map(function (parent) {
            return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || (DomStructure.isBlock(parent) && !Compare.eq(cell, parent)) ? [] :  [ Element.fromTag('br') ];
          });
        }).getOr([]);
      };

      var markContent = function () {
        var content = Arr.bind(cells, function (cell) {
          var children = Traverse.children(cell);
          return advancedBr(children) ? [ ] : children.concat(markCell(cell));
        });

        return content.length === 0 ? [ Element.fromTag('br') ] : content;
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