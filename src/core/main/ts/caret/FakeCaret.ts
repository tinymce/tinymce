/**
 * FakeCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CaretContainer from './CaretContainer';
import CaretContainerRemove from './CaretContainerRemove';
import DomQuery from '../dom/DomQuery';
import NodeType from '../dom/NodeType';
import ClientRect from '../geom/ClientRect';
import Delay from '../util/Delay';

/**
 * This module contains logic for rendering a fake visual caret.
 *
 * @private
 * @class tinymce.caret.FakeCaret
 */

const isContentEditableFalse = NodeType.isContentEditableFalse;

const isTableCell = function (node) {
  return node && /^(TD|TH)$/i.test(node.nodeName);
};

export default function (rootNode, isBlock) {
  let cursorInterval, $lastVisualCaret = null, caretContainerNode;

  const getAbsoluteClientRect = function (node, before) {
    const clientRect = ClientRect.collapse(node.getBoundingClientRect(), before);
    let docElm, scrollX, scrollY, margin, rootRect;

    if (rootNode.tagName === 'BODY') {
      docElm = rootNode.ownerDocument.documentElement;
      scrollX = rootNode.scrollLeft || docElm.scrollLeft;
      scrollY = rootNode.scrollTop || docElm.scrollTop;
    } else {
      rootRect = rootNode.getBoundingClientRect();
      scrollX = rootNode.scrollLeft - rootRect.left;
      scrollY = rootNode.scrollTop - rootRect.top;
    }

    clientRect.left += scrollX;
    clientRect.right += scrollX;
    clientRect.top += scrollY;
    clientRect.bottom += scrollY;
    clientRect.width = 1;

    margin = node.offsetWidth - node.clientWidth;

    if (margin > 0) {
      if (before) {
        margin *= -1;
      }

      clientRect.left += margin;
      clientRect.right += margin;
    }

    return clientRect;
  };

  const trimInlineCaretContainers = function () {
    let contentEditableFalseNodes, node, sibling, i, data;

    contentEditableFalseNodes = DomQuery('*[contentEditable=false]', rootNode);
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

    return null;
  };

  const show = function (before, node) {
    let clientRect, rng;

    hide();

    if (isTableCell(node)) {
      return null;
    }

    if (isBlock(node)) {
      caretContainerNode = CaretContainer.insertBlock('p', node, before);
      clientRect = getAbsoluteClientRect(node, before);
      DomQuery(caretContainerNode).css('top', clientRect.top);

      $lastVisualCaret = DomQuery('<div class="mce-visual-caret" data-mce-bogus="all"></div>').css(clientRect).appendTo(rootNode);

      if (before) {
        $lastVisualCaret.addClass('mce-visual-caret-before');
      }

      startBlink();

      rng = node.ownerDocument.createRange();
      rng.setStart(caretContainerNode, 0);
      rng.setEnd(caretContainerNode, 0);
    } else {
      caretContainerNode = CaretContainer.insertInline(node, before);
      rng = node.ownerDocument.createRange();

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

  const hide = function () {
    trimInlineCaretContainers();

    if (caretContainerNode) {
      CaretContainerRemove.remove(caretContainerNode);
      caretContainerNode = null;
    }

    if ($lastVisualCaret) {
      $lastVisualCaret.remove();
      $lastVisualCaret = null;
    }

    clearInterval(cursorInterval);
  };

  const hasFocus = function () {
    return rootNode.ownerDocument.activeElement === rootNode;
  };

  const startBlink = function () {
    cursorInterval = Delay.setInterval(function () {
      if (hasFocus()) {
        DomQuery('div.mce-visual-caret', rootNode).toggleClass('mce-visual-caret-hidden');
      } else {
        DomQuery('div.mce-visual-caret', rootNode).addClass('mce-visual-caret-hidden');
      }
    }, 500);
  };

  const destroy = function () {
    Delay.clearInterval(cursorInterval);
  };

  const getCss = function () {
    return (
      '.mce-visual-caret {' +
      'position: absolute;' +
      'background-color: black;' +
      'background-color: currentcolor;' +
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
    destroy
  };
}