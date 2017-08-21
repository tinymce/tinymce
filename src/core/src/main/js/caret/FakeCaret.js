/**
 * FakeCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for rendering a fake visual caret.
 *
 * @private
 * @class tinymce.caret.FakeCaret
 */
define(
  'tinymce.core.caret.FakeCaret',
  [
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretContainerRemove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.geom.ClientRect',
    'tinymce.core.util.Delay'
  ],
  function (CaretContainer, CaretContainerRemove, CaretPosition, DomQuery, NodeType, RangeUtils, ClientRect, Delay) {
    var isContentEditableFalse = NodeType.isContentEditableFalse;

    var isTableCell = function (node) {
      return node && /^(TD|TH)$/i.test(node.nodeName);
    };

    return function (rootNode, isBlock) {
      var cursorInterval, $lastVisualCaret, caretContainerNode;

      function getAbsoluteClientRect(node, before) {
        var clientRect = ClientRect.collapse(node.getBoundingClientRect(), before),
          docElm, scrollX, scrollY, margin, rootRect;

        if (rootNode.tagName == 'BODY') {
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
      }

      function trimInlineCaretContainers() {
        var contentEditableFalseNodes, node, sibling, i, data;

        contentEditableFalseNodes = DomQuery('*[contentEditable=false]', rootNode);
        for (i = 0; i < contentEditableFalseNodes.length; i++) {
          node = contentEditableFalseNodes[i];

          sibling = node.previousSibling;
          if (CaretContainer.endsWithCaretContainer(sibling)) {
            data = sibling.data;

            if (data.length == 1) {
              sibling.parentNode.removeChild(sibling);
            } else {
              sibling.deleteData(data.length - 1, 1);
            }
          }

          sibling = node.nextSibling;
          if (CaretContainer.startsWithCaretContainer(sibling)) {
            data = sibling.data;

            if (data.length == 1) {
              sibling.parentNode.removeChild(sibling);
            } else {
              sibling.deleteData(0, 1);
            }
          }
        }

        return null;
      }

      function show(before, node) {
        var clientRect, rng;

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
      }

      function hide() {
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
      }

      function startBlink() {
        cursorInterval = Delay.setInterval(function () {
          DomQuery('div.mce-visual-caret', rootNode).toggleClass('mce-visual-caret-hidden');
        }, 500);
      }

      function destroy() {
        Delay.clearInterval(cursorInterval);
      }

      function getCss() {
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
      }

      return {
        show: show,
        hide: hide,
        getCss: getCss,
        destroy: destroy
      };
    };
  }
);