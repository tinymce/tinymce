import { Arr, Fun, Optional, Type } from '@ephox/katamari';
import { Selectors, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import * as TransparentElements from '../content/TransparentElements';
import * as NodeType from '../dom/NodeType';
import * as Bidi from '../text/Bidi';

const isInlineTarget = (editor: Editor, elm: Node): elm is Element =>
  Selectors.is(SugarElement.fromDom(elm), Options.getInlineBoundarySelector(editor))
  && !TransparentElements.isTransparentBlock(editor.schema, elm)
  && editor.dom.isEditable(elm);

const isRtl = (element: Element): boolean =>
  DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent ?? '');

const findInlineParents = (isInlineTarget: (elem: Element) => boolean, rootNode: Node, pos: CaretPosition): Node[] =>
  Arr.filter(DOMUtils.DOM.getParents(pos.container(), '*', rootNode), isInlineTarget);

const findRootInline = (isInlineTarget: (elem: Element) => boolean, rootNode: Node, pos: CaretPosition): Optional<Node> => {
  const parents = findInlineParents(isInlineTarget, rootNode, pos);
  return Optional.from(parents[parents.length - 1]);
};

const hasSameParentBlock = (rootNode: Node, node1: Node, node2: Node): boolean => {
  const block1 = CaretUtils.getParentBlock(node1, rootNode);
  const block2 = CaretUtils.getParentBlock(node2, rootNode);
  return Type.isNonNullable(block1) && block1 === block2;
};

const isAtZwsp = (pos: CaretPosition): boolean =>
  CaretContainer.isBeforeInline(pos) || CaretContainer.isAfterInline(pos);

const normalizePosition = (forward: boolean, pos: CaretPosition): CaretPosition => {
  const container = pos.container(), offset = pos.offset();

  if (forward) {
    if (CaretContainer.isCaretContainerInline(container)) {
      if (NodeType.isText(container.nextSibling)) {
        return CaretPosition(container.nextSibling, 0);
      } else {
        return CaretPosition.after(container);
      }
    } else {
      return CaretContainer.isBeforeInline(pos) ? CaretPosition(container, offset + 1) : pos;
    }
  } else {
    if (CaretContainer.isCaretContainerInline(container)) {
      if (NodeType.isText(container.previousSibling)) {
        return CaretPosition(container.previousSibling, container.previousSibling.data.length);
      } else {
        return CaretPosition.before(container);
      }
    } else {
      return CaretContainer.isAfterInline(pos) ? CaretPosition(container, offset - 1) : pos;
    }
  }
};

const normalizeForwards = Fun.curry(normalizePosition, true);
const normalizeBackwards = Fun.curry(normalizePosition, false);

export {
  isInlineTarget,
  findRootInline,
  isRtl,
  isAtZwsp,
  normalizePosition,
  normalizeForwards,
  normalizeBackwards,
  hasSameParentBlock
};
