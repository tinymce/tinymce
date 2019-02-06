import { Arr } from '@ephox/katamari';
import { DomStructure } from '@ephox/robin';
import { Compare, CursorPosition, Element, InsertAll, Node, PredicateFind, Remove, Text, Traverse } from '@ephox/sugar';

const merge = function (cells) {
  const isBr = function (el) {
    return Node.name(el) === 'br';
  };

  const advancedBr = function (children) {
    return Arr.forall(children, function (c) {
      return isBr(c) || (Node.isText(c) && Text.get(c).trim().length === 0);
    });
  };

  const isListItem = function (el) {
    return Node.name(el) === 'li' || PredicateFind.ancestor(el, DomStructure.isList).isSome();
  };

  const siblingIsBlock = function (el) {
    return Traverse.nextSibling(el).map(function (rightSibling) {
      if (DomStructure.isBlock(rightSibling)) { return true; }
      if (DomStructure.isEmptyTag(rightSibling)) {
        return Node.name(rightSibling) === 'img' ? false : true;
      }
    }).getOr(false);
  };

  const markCell = function (cell) {
    return CursorPosition.last(cell).bind(function (rightEdge) {
      const rightSiblingIsBlock = siblingIsBlock(rightEdge);
      return Traverse.parent(rightEdge).map(function (parent) {
        return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || (DomStructure.isBlock(parent) && !Compare.eq(cell, parent)) ? [] :  [ Element.fromTag('br') ];
      });
    }).getOr([]);
  };

  const markContent = function () {
    const content = Arr.bind(cells, function (cell) {
      const children = Traverse.children(cell);
      return advancedBr(children) ? [ ] : children.concat(markCell(cell));
    });

    return content.length === 0 ? [ Element.fromTag('br') ] : content;
  };

  const contents = markContent();
  Remove.empty(cells[0]);
  InsertAll.append(cells[0], contents);
};

export default {
  merge
};