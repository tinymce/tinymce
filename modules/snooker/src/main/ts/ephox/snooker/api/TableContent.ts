import { Arr } from '@ephox/katamari';
import { DomStructure } from '@ephox/robin';
import { Compare, CursorPosition, InsertAll, PredicateFind, Remove, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';

const merge = function (cells: SugarElement[]) {
  const isBr = function (el: SugarElement) {
    return SugarNode.name(el) === 'br';
  };

  const advancedBr = function (children: SugarElement[]) {
    return Arr.forall(children, function (c) {
      return isBr(c) || (SugarNode.isText(c) && SugarText.get(c).trim().length === 0);
    });
  };

  const isListItem = function (el: SugarElement) {
    return SugarNode.name(el) === 'li' || PredicateFind.ancestor(el, DomStructure.isList).isSome();
  };

  const siblingIsBlock = function (el: SugarElement) {
    return Traverse.nextSibling(el).map(function (rightSibling) {
      if (DomStructure.isBlock(rightSibling)) {
        return true;
      }
      if (DomStructure.isEmptyTag(rightSibling)) {
        return SugarNode.name(rightSibling) === 'img' ? false : true;
      }
      return false;
    }).getOr(false);
  };

  const markCell = function (cell: SugarElement) {
    return CursorPosition.last(cell).bind(function (rightEdge) {
      const rightSiblingIsBlock = siblingIsBlock(rightEdge);
      return Traverse.parent(rightEdge).map(function (parent) {
        return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || (DomStructure.isBlock(parent) && !Compare.eq(cell, parent)) ? [] : [ SugarElement.fromTag('br') ];
      });
    }).getOr([]);
  };

  const markContent = function () {
    const content = Arr.bind(cells, function (cell) {
      const children = Traverse.children(cell);
      return advancedBr(children) ? [ ] : children.concat(markCell(cell));
    });

    return content.length === 0 ? [ SugarElement.fromTag('br') ] : content;
  };

  const contents = markContent();
  Remove.empty(cells[0]);
  InsertAll.append(cells[0], contents);
};

export {
  merge
};
