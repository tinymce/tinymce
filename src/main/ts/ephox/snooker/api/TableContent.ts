import { Arr } from '@ephox/katamari';
import { DomStructure } from '@ephox/robin';
import { Compare } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Text } from '@ephox/sugar';
import { PredicateFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { CursorPosition } from '@ephox/sugar';

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
    return Traverse.nextSibling(el).map(function (rightSibling) {
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

export default {
  merge: merge
};