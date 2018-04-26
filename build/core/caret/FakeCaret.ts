/**
 * FakeCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import * as CaretContainer from './CaretContainer';
import CaretContainerRemove from './CaretContainerRemove';
import DomQuery from '../api/dom/DomQuery';
import NodeType from '../dom/NodeType';
import * as ClientRect from '../geom/ClientRect';
import Delay from '../api/util/Delay';
import { isFakeCaretTableBrowser } from '../keyboard/TableNavigation';
import { Cell, Option } from '@ephox/katamari';

export interface FakeCaret {
  show: (before: boolean, element: Element) => Range;
  hide: () => void;
  getCss: () => string;
  reposition: () => void;
  destroy: () => void;
}

interface CaretState {
  caret: HTMLElement;
  element: HTMLElement;
  before: boolean;
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const isTableCell = (node: Node) => NodeType.isElement(node) && /^(TD|TH)$/i.test(node.tagName);

const getAbsoluteClientRect = (root: HTMLElement, element: HTMLElement, before: boolean): ClientRect => {
  const clientRect = ClientRect.collapse(element.getBoundingClientRect(), before);
  let docElm, scrollX, scrollY, margin, rootRect;

  if (root.tagName === 'BODY') {
    docElm = root.ownerDocument.documentElement;
    scrollX = root.scrollLeft || docElm.scrollLeft;
    scrollY = root.scrollTop || docElm.scrollTop;
  } else {
    rootRect = root.getBoundingClientRect();
    scrollX = root.scrollLeft - rootRect.left;
    scrollY = root.scrollTop - rootRect.top;
  }

  clientRect.left += scrollX;
  clientRect.right += scrollX;
  clientRect.top += scrollY;
  clientRect.bottom += scrollY;
  clientRect.width = 1;

  margin = element.offsetWidth - element.clientWidth;

  if (margin > 0) {
    if (before) {
      margin *= -1;
    }

    clientRect.left += margin;
    clientRect.right += margin;
  }

  return clientRect;
};

const trimInlineCaretContainers = (root: Node): void => {
  let contentEditableFalseNodes, node, sibling, i, data;

  contentEditableFalseNodes = DomQuery('*[contentEditable=false]', root);
  for (i = 0; i < contentEditableFalseNodes.length; i++) {
    node = contentEditableFalseNodes[i];

    sibling = node.previousSibling;
    if (CaretContainer.endsWithCaretContainer(sibling)) {
      data = sibling.data;

      if (data.length === 1) {
        sibling.parentNode.removeChild(sibling);
      } else {
        sibling.deleteData(data.length - 1, 1);
      }
    }

    sibling = node.nextSibling;
    if (CaretContainer.startsWithCaretContainer(sibling)) {
      data = sibling.data;

      if (data.length === 1) {
        sibling.parentNode.removeChild(sibling);
      } else {
        sibling.deleteData(0, 1);
      }
    }
  }
};

export const FakeCaret = (root: HTMLElement, isBlock: (node: Node) => boolean, hasFocus: () => boolean): FakeCaret => {
  const lastVisualCaret = Cell<Option<CaretState>>(Option.none());
  let cursorInterval, caretContainerNode;

  const show = (before: boolean, element: HTMLElement): Range => {
    let clientRect, rng;

    hide();

    if (isTableCell(element)) {
      return null;
    }

    if (isBlock(element)) {
      caretContainerNode = CaretContainer.insertBlock('p', element, before);
      clientRect = getAbsoluteClientRect(root, element, before);
      DomQuery(caretContainerNode).css('top', clientRect.top);

      const caret = DomQuery('<div class="mce-visual-caret" data-mce-bogus="all"></div>').css(clientRect).appendTo(root)[0];
      lastVisualCaret.set(Option.some({ caret, element, before }));

      lastVisualCaret.get().each((caretState) => {
        if (before) {
          DomQuery(caretState.caret).addClass('mce-visual-caret-before');
        }
      });

      startBlink();

      rng = element.ownerDocument.createRange();
      rng.setStart(caretContainerNode, 0);
      rng.setEnd(caretContainerNode, 0);
    } else {
      caretContainerNode = CaretContainer.insertInline(element, before);
      rng = element.ownerDocument.createRange();

      if (isContentEditableFalse(caretContainerNode.nextSibling)) {
        rng.setStart(caretContainerNode, 0);
        rng.setEnd(caretContainerNode, 0);
      } else {
        rng.setStart(caretContainerNode, 1);
        rng.setEnd(caretContainerNode, 1);
      }

      return rng;
    }

    return rng;
  };

  const hide = () => {
    trimInlineCaretContainers(root);

    if (caretContainerNode) {
      CaretContainerRemove.remove(caretContainerNode);
      caretContainerNode = null;
    }

    lastVisualCaret.get().each((caretState) => {
      DomQuery(caretState.caret).remove();
      lastVisualCaret.set(Option.none());
    });

    clearInterval(cursorInterval);
  };

  const startBlink = () => {
    cursorInterval = Delay.setInterval(() => {
      if (hasFocus()) {
        DomQuery('div.mce-visual-caret', root).toggleClass('mce-visual-caret-hidden');
      } else {
        DomQuery('div.mce-visual-caret', root).addClass('mce-visual-caret-hidden');
      }
    }, 500);
  };

  const reposition = () => {
    lastVisualCaret.get().each((caretState) => {
      const clientRect = getAbsoluteClientRect(root, caretState.element, caretState.before);
      DomQuery(caretState.caret).css(clientRect);
    });
  };

  const destroy = () => Delay.clearInterval(cursorInterval);

  const getCss = () => {
    return (
      '.mce-visual-caret {' +
      'position: absolute;' +
      'background-color: black;' +
      'background-color: currentcolor;' +
      // 'background-color: red;' +
      '}' +
      '.mce-visual-caret-hidden {' +
      'display: none;' +
      '}' +
      '*[data-mce-caret] {' +
      'position: absolute;' +
      'left: -1000px;' +
      'right: auto;' +
      'top: 0;' +
      'margin: 0;' +
      'padding: 0;' +
      '}'
    );
  };

  return {
    show,
    hide,
    getCss,
    reposition,
    destroy
  };
};

export const isFakeCaretTarget = (node: Node): boolean => isContentEditableFalse(node) || (NodeType.isTable(node) && isFakeCaretTableBrowser());
