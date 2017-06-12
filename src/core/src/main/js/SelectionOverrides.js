/**
 * SelectionOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic overriding the selection with keyboard/mouse
 * around contentEditable=false regions.
 *
 * @example
 * // Disable the default cE=false selection
 * tinymce.activeEditor.on('ShowCaret BeforeObjectSelected', function(e) {
 *     e.preventDefault();
 * });
 *
 * @private
 * @class tinymce.SelectionOverrides
 */
define(
  'tinymce.core.SelectionOverrides',
  [
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.caret.FakeCaret',
    'tinymce.core.caret.LineUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangePoint',
    'tinymce.core.DragDropOverrides',
    'tinymce.core.EditorView',
    'tinymce.core.Env',
    'tinymce.core.keyboard.CefUtils',
    'tinymce.core.util.Delay',
    'tinymce.core.util.VK'
  ],
  function (
    CaretContainer, CaretPosition, CaretUtils, CaretWalker, FakeCaret, LineUtils, NodeType, RangePoint, DragDropOverrides, EditorView, Env, CefUtils, Delay,
    VK
  ) {
    var isContentEditableTrue = NodeType.isContentEditableTrue,
      isContentEditableFalse = NodeType.isContentEditableFalse,
      isAfterContentEditableFalse = CaretUtils.isAfterContentEditableFalse,
      isBeforeContentEditableFalse = CaretUtils.isBeforeContentEditableFalse;

    function SelectionOverrides(editor) {
      var rootNode = editor.getBody();
      var fakeCaret = new FakeCaret(editor.getBody(), isBlock),
        realSelectionId = 'sel-' + editor.dom.uniqueId(),
        selectedContentEditableNode;

      function isFakeSelectionElement(elm) {
        return editor.dom.hasClass(elm, 'mce-offscreen-selection');
      }

      function getRealSelectionElement() {
        var container = editor.dom.get(realSelectionId);
        return container ? container.getElementsByTagName('*')[0] : container;
      }

      function isBlock(node) {
        return editor.dom.isBlock(node);
      }

      function setRange(range) {
        //console.log('setRange', range);
        if (range) {
          editor.selection.setRng(range);
        }
      }

      function getRange() {
        return editor.selection.getRng();
      }

      function scrollIntoView(node, alignToTop) {
        editor.selection.scrollIntoView(node, alignToTop);
      }

      function showCaret(direction, node, before) {
        var e;

        e = editor.fire('ShowCaret', {
          target: node,
          direction: direction,
          before: before
        });

        if (e.isDefaultPrevented()) {
          return null;
        }

        scrollIntoView(node, direction === -1);

        return fakeCaret.show(before, node);
      }

      function getNormalizedRangeEndPoint(direction, range) {
        range = CaretUtils.normalizeRange(direction, rootNode, range);

        if (direction == -1) {
          return CaretPosition.fromRangeStart(range);
        }

        return CaretPosition.fromRangeEnd(range);
      }

      function showBlockCaretContainer(blockCaretContainer) {
        if (blockCaretContainer.hasAttribute('data-mce-caret')) {
          CaretContainer.showCaretContainerBlock(blockCaretContainer);
          setRange(getRange()); // Removes control rect on IE
          scrollIntoView(blockCaretContainer[0]);
        }
      }

      function registerEvents() {
        function getContentEditableRoot(node) {
          var root = editor.getBody();

          while (node && node != root) {
            if (isContentEditableTrue(node) || isContentEditableFalse(node)) {
              return node;
            }

            node = node.parentNode;
          }

          return null;
        }

        // Some browsers (Chrome) lets you place the caret after a cE=false
        // Make sure we render the caret container in this case
        editor.on('mouseup', function (e) {
          var range = getRange();

          if (range.collapsed && EditorView.isXYInContentArea(editor, e.clientX, e.clientY)) {
            setRange(CefUtils.renderCaretAtRange(editor, range));
          }
        });

        editor.on('click', function (e) {
          var contentEditableRoot;

          contentEditableRoot = getContentEditableRoot(e.target);
          if (contentEditableRoot) {
            // Prevent clicks on links in a cE=false element
            if (isContentEditableFalse(contentEditableRoot)) {
              e.preventDefault();
              editor.focus();
            }

            // Removes fake selection if a cE=true is clicked within a cE=false like the toc title
            if (isContentEditableTrue(contentEditableRoot)) {
              if (editor.dom.isChildOf(contentEditableRoot, editor.selection.getNode())) {
                removeContentEditableSelection();
              }
            }
          }
        });

        editor.on('blur NewBlock', function () {
          removeContentEditableSelection();
          hideFakeCaret();
        });

        function handleTouchSelect(editor) {
          var moved = false;

          editor.on('touchstart', function () {
            moved = false;
          });

          editor.on('touchmove', function () {
            moved = true;
          });

          editor.on('touchend', function (e) {
            var contentEditableRoot = getContentEditableRoot(e.target);

            if (isContentEditableFalse(contentEditableRoot)) {
              if (!moved) {
                e.preventDefault();
                setContentEditableSelection(CefUtils.selectNode(editor, contentEditableRoot));
              }
            }
          });
        }

        var hasNormalCaretPosition = function (elm) {
          var caretWalker = new CaretWalker(elm);

          if (!elm.firstChild) {
            return false;
          }

          var startPos = CaretPosition.before(elm.firstChild);
          var newPos = caretWalker.next(startPos);

          return newPos && !isBeforeContentEditableFalse(newPos) && !isAfterContentEditableFalse(newPos);
        };

        var isInSameBlock = function (node1, node2) {
          var block1 = editor.dom.getParent(node1, editor.dom.isBlock);
          var block2 = editor.dom.getParent(node2, editor.dom.isBlock);
          return block1 === block2;
        };

        // Checks if the target node is in a block and if that block has a caret position better than the
        // suggested caretNode this is to prevent the caret from being sucked in towards a cE=false block if
        // they are adjacent on the vertical axis
        var hasBetterMouseTarget = function (targetNode, caretNode) {
          var targetBlock = editor.dom.getParent(targetNode, editor.dom.isBlock);
          var caretBlock = editor.dom.getParent(caretNode, editor.dom.isBlock);

          return targetBlock && !isInSameBlock(targetBlock, caretBlock) && hasNormalCaretPosition(targetBlock);
        };

        handleTouchSelect(editor);

        editor.on('mousedown', function (e) {
          var contentEditableRoot;

          if (EditorView.isXYInContentArea(editor, e.clientX, e.clientY) === false) {
            return;
          }

          contentEditableRoot = getContentEditableRoot(e.target);
          if (contentEditableRoot) {
            if (isContentEditableFalse(contentEditableRoot)) {
              e.preventDefault();
              setContentEditableSelection(CefUtils.selectNode(editor, contentEditableRoot));
            } else {
              removeContentEditableSelection();

              // Check that we're not attempting a shift + click select within a contenteditable='true' element
              if (!(isContentEditableTrue(contentEditableRoot) && e.shiftKey) && !RangePoint.isXYWithinRange(e.clientX, e.clientY, editor.selection.getRng())) {
                editor.selection.placeCaretAt(e.clientX, e.clientY);
              }
            }
          } else {
            // Remove needs to be called here since the mousedown might alter the selection without calling selection.setRng
            // and therefore not fire the AfterSetSelectionRange event.
            removeContentEditableSelection();
            hideFakeCaret();

            var caretInfo = LineUtils.closestCaret(rootNode, e.clientX, e.clientY);
            if (caretInfo) {
              if (!hasBetterMouseTarget(e.target, caretInfo.node)) {
                e.preventDefault();
                editor.getBody().focus();
                setRange(showCaret(1, caretInfo.node, caretInfo.before));
              }
            }
          }
        });

        editor.on('keypress', function (e) {
          if (VK.modifierPressed(e)) {
            return;
          }

          switch (e.keyCode) {
            default:
              if (isContentEditableFalse(editor.selection.getNode())) {
                e.preventDefault();
              }
              break;
          }
        });

        editor.on('getSelectionRange', function (e) {
          var rng = e.range;

          if (selectedContentEditableNode) {
            if (!selectedContentEditableNode.parentNode) {
              selectedContentEditableNode = null;
              return;
            }

            rng = rng.cloneRange();
            rng.selectNode(selectedContentEditableNode);
            e.range = rng;
          }
        });

        editor.on('setSelectionRange', function (e) {
          var rng;

          rng = setContentEditableSelection(e.range, e.forward);
          if (rng) {
            e.range = rng;
          }
        });

        editor.on('AfterSetSelectionRange', function (e) {
          var rng = e.range;

          if (!isRangeInCaretContainer(rng)) {
            hideFakeCaret();
          }

          if (!isFakeSelectionElement(rng.startContainer.parentNode)) {
            removeContentEditableSelection();
          }
        });

        editor.on('focus', function () {
          // Make sure we have a proper fake caret on focus
          Delay.setEditorTimeout(editor, function () {
            editor.selection.setRng(CefUtils.renderRangeCaret(editor, editor.selection.getRng()));
          }, 0);
        });

        editor.on('copy', function (e) {
          var clipboardData = e.clipboardData;

          // Make sure we get proper html/text for the fake cE=false selection
          // Doesn't work at all on Edge since it doesn't have proper clipboardData support
          if (!e.isDefaultPrevented() && e.clipboardData && !Env.ie) {
            var realSelectionElement = getRealSelectionElement();
            if (realSelectionElement) {
              e.preventDefault();
              clipboardData.clearData();
              clipboardData.setData('text/html', realSelectionElement.outerHTML);
              clipboardData.setData('text/plain', realSelectionElement.outerText);
            }
          }
        });

        DragDropOverrides.init(editor);
      }

      function addCss() {
        var styles = editor.contentStyles, rootClass = '.mce-content-body';

        styles.push(fakeCaret.getCss());
        styles.push(
          rootClass + ' .mce-offscreen-selection {' +
          'position: absolute;' +
          'left: -9999999999px;' +
          'max-width: 1000000px;' +
          '}' +
          rootClass + ' *[contentEditable=false] {' +
          'cursor: default;' +
          '}' +
          rootClass + ' *[contentEditable=true] {' +
          'cursor: text;' +
          '}'
        );
      }

      function isWithinCaretContainer(node) {
        return (
          CaretContainer.isCaretContainer(node) ||
          CaretContainer.startsWithCaretContainer(node) ||
          CaretContainer.endsWithCaretContainer(node)
        );
      }

      function isRangeInCaretContainer(rng) {
        return isWithinCaretContainer(rng.startContainer) || isWithinCaretContainer(rng.endContainer);
      }

      function setContentEditableSelection(range, forward) {
        var node, $ = editor.$, dom = editor.dom, $realSelectionContainer, sel,
          startContainer, startOffset, endOffset, e, caretPosition, targetClone, origTargetClone;

        if (!range) {
          return null;
        }

        if (range.collapsed) {
          if (!isRangeInCaretContainer(range)) {
            if (forward === false) {
              caretPosition = getNormalizedRangeEndPoint(-1, range);

              if (isContentEditableFalse(caretPosition.getNode(true))) {
                return showCaret(-1, caretPosition.getNode(true), false);
              }

              if (isContentEditableFalse(caretPosition.getNode())) {
                return showCaret(-1, caretPosition.getNode(), !caretPosition.isAtEnd());
              }
            } else {
              caretPosition = getNormalizedRangeEndPoint(1, range);

              if (isContentEditableFalse(caretPosition.getNode())) {
                return showCaret(1, caretPosition.getNode(), !caretPosition.isAtEnd());
              }

              if (isContentEditableFalse(caretPosition.getNode(true))) {
                return showCaret(1, caretPosition.getNode(true), false);
              }
            }
          }

          return null;
        }

        startContainer = range.startContainer;
        startOffset = range.startOffset;
        endOffset = range.endOffset;

        // Normalizes <span cE=false>[</span>] to [<span cE=false></span>]
        if (startContainer.nodeType == 3 && startOffset == 0 && isContentEditableFalse(startContainer.parentNode)) {
          startContainer = startContainer.parentNode;
          startOffset = dom.nodeIndex(startContainer);
          startContainer = startContainer.parentNode;
        }

        if (startContainer.nodeType != 1) {
          return null;
        }

        if (endOffset == startOffset + 1) {
          node = startContainer.childNodes[startOffset];
        }

        if (!isContentEditableFalse(node)) {
          return null;
        }

        targetClone = origTargetClone = node.cloneNode(true);
        e = editor.fire('ObjectSelected', { target: node, targetClone: targetClone });
        if (e.isDefaultPrevented()) {
          return null;
        }

        targetClone = e.targetClone;
        $realSelectionContainer = $('#' + realSelectionId);
        if ($realSelectionContainer.length === 0) {
          $realSelectionContainer = $(
            '<div data-mce-bogus="all" class="mce-offscreen-selection"></div>'
          ).attr('id', realSelectionId);

          $realSelectionContainer.appendTo(editor.getBody());
        }

        range = editor.dom.createRng();

        // WHY is IE making things so hard! Copy on <i contentEditable="false">x</i> produces: <em>x</em>
        // This is a ridiculous hack where we place the selection from a block over the inline element
        // so that just the inline element is copied as is and not converted.
        if (targetClone === origTargetClone && Env.ie) {
          $realSelectionContainer.empty().append('<p style="font-size: 0" data-mce-bogus="all">\u00a0</p>').append(targetClone);
          range.setStartAfter($realSelectionContainer[0].firstChild.firstChild);
          range.setEndAfter(targetClone);
        } else {
          $realSelectionContainer.empty().append('\u00a0').append(targetClone).append('\u00a0');
          range.setStart($realSelectionContainer[0].firstChild, 1);
          range.setEnd($realSelectionContainer[0].lastChild, 0);
        }

        $realSelectionContainer.css({
          top: dom.getPos(node, editor.getBody()).y
        });

        $realSelectionContainer[0].focus();
        sel = editor.selection.getSel();
        sel.removeAllRanges();
        sel.addRange(range);

        editor.$('*[data-mce-selected]').removeAttr('data-mce-selected');
        node.setAttribute('data-mce-selected', 1);
        selectedContentEditableNode = node;
        hideFakeCaret();

        return range;
      }

      function removeContentEditableSelection() {
        if (selectedContentEditableNode) {
          selectedContentEditableNode.removeAttribute('data-mce-selected');
          editor.$('#' + realSelectionId).remove();
          selectedContentEditableNode = null;
        }
      }

      function destroy() {
        fakeCaret.destroy();
        selectedContentEditableNode = null;
      }

      function hideFakeCaret() {
        fakeCaret.hide();
      }

      if (Env.ceFalse) {
        registerEvents();
        addCss();
      }

      return {
        showCaret: showCaret,
        showBlockCaretContainer: showBlockCaretContainer,
        hideFakeCaret: hideFakeCaret,
        destroy: destroy
      };
    }

    return SelectionOverrides;
  }
);
