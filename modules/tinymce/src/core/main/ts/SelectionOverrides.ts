/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLElement, MouseEvent, Node, Range } from '@ephox/dom-globals';
import { Arr, Obj, Unicode } from '@ephox/katamari';
import { Attr, Compare, Element as SugarElement, Remove, SelectorFilter, SelectorFind } from '@ephox/sugar';
import Editor from './api/Editor';
import Env from './api/Env';
import VK from './api/util/VK';
import * as CaretContainer from './caret/CaretContainer';
import CaretPosition from './caret/CaretPosition';
import { isAfterContentEditableFalse, isBeforeContentEditableFalse } from './caret/CaretPositionPredicates';
import * as CaretUtils from './caret/CaretUtils';
import { CaretWalker } from './caret/CaretWalker';
import { FakeCaret, isFakeCaretTarget } from './caret/FakeCaret';
import * as LineUtils from './caret/LineUtils';
import * as NodeType from './dom/NodeType';
import * as RangePoint from './dom/RangePoint';
import * as DragDropOverrides from './DragDropOverrides';
import * as EditorView from './EditorView';
import * as CefFocus from './focus/CefFocus';
import * as EditorFocus from './focus/EditorFocus';
import * as CefUtils from './keyboard/CefUtils';

const isContentEditableTrue = NodeType.isContentEditableTrue;
const isContentEditableFalse = NodeType.isContentEditableFalse;

interface SelectionOverrides {
  showCaret: (direction: number, node: Element, before: boolean, scrollIntoView?: boolean) => Range;
  showBlockCaretContainer: (blockCaretContainer: Element) => void;
  hideFakeCaret: () => void;
  destroy: () => void;
}

const getContentEditableRoot = (editor: Editor, node: Node): Node => {
  const root = editor.getBody();

  while (node && node !== root) {
    if (isContentEditableTrue(node) || isContentEditableFalse(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

const SelectionOverrides = function (editor: Editor): SelectionOverrides {
  const isBlock = function (node) {
    return editor.dom.isBlock(node);
  };

  const rootNode = editor.getBody();
  const fakeCaret = FakeCaret(editor, rootNode, isBlock, () => EditorFocus.hasFocus(editor));
  const realSelectionId = 'sel-' + editor.dom.uniqueId();
  let selectedContentEditableNode;

  const isFakeSelectionElement = function (elm) {
    return editor.dom.hasClass(elm, 'mce-offscreen-selection');
  };

  const getRealSelectionElement = function () {
    const container = editor.dom.get(realSelectionId);
    return container ? container.getElementsByTagName('*')[0] as HTMLElement : container;
  };

  const setRange = function (range: Range) {
    // console.log('setRange', range);
    if (range) {
      editor.selection.setRng(range);
    }
  };

  const getRange = function () {
    return editor.selection.getRng();
  };

  const showCaret = (direction: number, node: Element, before: boolean, scrollIntoView: boolean = true): Range => {
    const e = editor.fire('ShowCaret', {
      target: node,
      direction,
      before
    });

    if (e.isDefaultPrevented()) {
      return null;
    }

    if (scrollIntoView) {
      editor.selection.scrollIntoView(node, direction === -1);
    }

    return fakeCaret.show(before, node);
  };

  const showBlockCaretContainer = function (blockCaretContainer: Element) {
    if (blockCaretContainer.hasAttribute('data-mce-caret')) {
      CaretContainer.showCaretContainerBlock(blockCaretContainer);
      setRange(getRange()); // Removes control rect on IE
      editor.selection.scrollIntoView(blockCaretContainer);
    }
  };

  const registerEvents = function () {
    // Some browsers (Chrome) lets you place the caret after a cE=false
    // Make sure we render the caret container in this case
    editor.on('mouseup', function (e) {
      const range = getRange();

      if (range.collapsed && EditorView.isXYInContentArea(editor, e.clientX, e.clientY)) {
        setRange(CefUtils.renderCaretAtRange(editor, range, false));
      }
    });

    editor.on('click', function (e) {
      const contentEditableRoot = getContentEditableRoot(editor, e.target);
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
    });

    editor.on('ResizeWindow FullscreenStateChanged', () => fakeCaret.reposition());

    const handleTouchSelect = function (editor: Editor) {
      editor.on('tap', (e) => {
        const contentEditableRoot = getContentEditableRoot(editor, e.target);
        if (isContentEditableFalse(contentEditableRoot)) {
          e.preventDefault();
          setContentEditableSelection(CefUtils.selectNode(editor, contentEditableRoot));
        }
      }, true);
    };

    const hasNormalCaretPosition = function (elm) {
      const caretWalker = CaretWalker(elm);

      if (!elm.firstChild) {
        return false;
      }

      const startPos = CaretPosition.before(elm.firstChild);
      const newPos = caretWalker.next(startPos);

      return newPos && !isBeforeContentEditableFalse(newPos) && !isAfterContentEditableFalse(newPos);
    };

    const isInSameBlock = function (node1, node2) {
      const block1 = editor.dom.getParent(node1, editor.dom.isBlock);
      const block2 = editor.dom.getParent(node2, editor.dom.isBlock);
      return block1 === block2;
    };

    // Checks if the target node is in a block and if that block has a caret position better than the
    // suggested caretNode this is to prevent the caret from being sucked in towards a cE=false block if
    // they are adjacent on the vertical axis
    const hasBetterMouseTarget = function (targetNode, caretNode) {
      const targetBlock = editor.dom.getParent(targetNode, editor.dom.isBlock);
      const caretBlock = editor.dom.getParent(caretNode, editor.dom.isBlock);

      // Click inside the suggested caret element
      if (targetBlock && editor.dom.isChildOf(targetBlock, caretBlock) && isContentEditableFalse(getContentEditableRoot(editor, targetBlock)) === false) {
        return true;
      }

      return targetBlock && !isInSameBlock(targetBlock, caretBlock) && hasNormalCaretPosition(targetBlock);
    };

    handleTouchSelect(editor);

    editor.on('mousedown', (e: MouseEvent) => {
      const targetElm = e.target as Element;

      if (targetElm !== rootNode && targetElm.nodeName !== 'HTML' && !editor.dom.isChildOf(targetElm, rootNode)) {
        return;
      }

      if (EditorView.isXYInContentArea(editor, e.clientX, e.clientY) === false) {
        return;
      }

      const contentEditableRoot = getContentEditableRoot(editor, targetElm);
      if (contentEditableRoot) {
        if (isContentEditableFalse(contentEditableRoot)) {
          e.preventDefault();
          setContentEditableSelection(CefUtils.selectNode(editor, contentEditableRoot));
        } else {
          removeContentEditableSelection();

          // Check that we're not attempting a shift + click select within a contenteditable='true' element
          if (!(isContentEditableTrue(contentEditableRoot) && e.shiftKey) && !RangePoint.isXYWithinRange(e.clientX, e.clientY, editor.selection.getRng())) {
            hideFakeCaret();
            editor.selection.placeCaretAt(e.clientX, e.clientY);
          }
        }
      } else if (isFakeCaretTarget(targetElm) === false) {
        // Remove needs to be called here since the mousedown might alter the selection without calling selection.setRng
        // and therefore not fire the AfterSetSelectionRange event.
        removeContentEditableSelection();
        hideFakeCaret();

        const fakeCaretInfo = LineUtils.closestFakeCaret(rootNode, e.clientX, e.clientY);
        if (fakeCaretInfo) {
          if (!hasBetterMouseTarget(e.target, fakeCaretInfo.node)) {
            e.preventDefault();
            const range = showCaret(1, fakeCaretInfo.node as HTMLElement, fakeCaretInfo.before, false);
            editor.getBody().focus();
            setRange(range);
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

    editor.on('GetSelectionRange', function (e) {
      let rng = e.range;

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

    editor.on('SetSelectionRange', function (e) {
      // If the range is set inside a short ended element, then move it
      // to the side as IE for example will try to add content inside
      e.range = normalizeShortEndedElementSelection(e.range);

      const rng = setContentEditableSelection(e.range, e.forward);
      if (rng) {
        e.range = rng;
      }
    });

    const isPasteBin = (node: Element): boolean => node.id === 'mcepastebin';

    editor.on('AfterSetSelectionRange', function (e) {
      const rng = e.range;

      if (!isRangeInCaretContainer(rng) && !isPasteBin(rng.startContainer.parentNode as Element)) {
        hideFakeCaret();
      }

      if (!isFakeSelectionElement(rng.startContainer.parentNode)) {
        removeContentEditableSelection();
      }
    });

    editor.on('copy', function (e) {
      const clipboardData = e.clipboardData;

      // Make sure we get proper html/text for the fake cE=false selection
      // Doesn't work at all on Edge since it doesn't have proper clipboardData support
      if (!e.isDefaultPrevented() && e.clipboardData && !Env.ie) {
        const realSelectionElement = getRealSelectionElement();
        if (realSelectionElement) {
          e.preventDefault();
          clipboardData.clearData();
          clipboardData.setData('text/html', realSelectionElement.outerHTML);
          clipboardData.setData('text/plain', realSelectionElement.outerText);
        }
      }
    });

    DragDropOverrides.init(editor);
    CefFocus.setup(editor);
  };

  const isWithinCaretContainer = function (node: Node) {
    return (
      CaretContainer.isCaretContainer(node) ||
      CaretContainer.startsWithCaretContainer(node) ||
      CaretContainer.endsWithCaretContainer(node)
    );
  };

  const isRangeInCaretContainer = function (rng: Range) {
    return isWithinCaretContainer(rng.startContainer) || isWithinCaretContainer(rng.endContainer);
  };

  const normalizeShortEndedElementSelection = (rng: Range) => {
    const shortEndedElements = editor.schema.getShortEndedElements();
    const newRng = editor.dom.createRng();
    const startContainer = rng.startContainer;
    const startOffset = rng.startOffset;
    const endContainer = rng.endContainer;
    const endOffset = rng.endOffset;

    if (Obj.has(shortEndedElements, startContainer.nodeName.toLowerCase())) {
      if (startOffset === 0) {
        newRng.setStartBefore(startContainer);
      } else {
        newRng.setStartAfter(startContainer);
      }
    } else {
      newRng.setStart(startContainer, startOffset);
    }

    if (Obj.has(shortEndedElements, endContainer.nodeName.toLowerCase())) {
      if (endOffset === 0) {
        newRng.setEndBefore(endContainer);
      } else {
        newRng.setEndAfter(endContainer);
      }
    } else {
      newRng.setEnd(endContainer, endOffset);
    }

    return newRng;
  };

  const setContentEditableSelection = function (range: Range, forward?: boolean) {
    let node;
    const $ = editor.$;
    const dom = editor.dom;
    let $realSelectionContainer, startContainer, startOffset, caretPosition, targetClone, origTargetClone;

    if (!range) {
      return null;
    }

    if (range.collapsed) {
      if (!isRangeInCaretContainer(range)) {
        if (forward === false) {
          caretPosition = CaretUtils.getNormalizedRangeEndPoint(-1, rootNode, range);

          if (isFakeCaretTarget(caretPosition.getNode(true))) {
            return showCaret(-1, caretPosition.getNode(true), false, false);
          }

          if (isFakeCaretTarget(caretPosition.getNode())) {
            return showCaret(-1, caretPosition.getNode(), !caretPosition.isAtEnd(), false);
          }
        } else {
          caretPosition = CaretUtils.getNormalizedRangeEndPoint(1, rootNode, range);

          if (isFakeCaretTarget(caretPosition.getNode())) {
            return showCaret(1, caretPosition.getNode(), !caretPosition.isAtEnd(), false);
          }

          if (isFakeCaretTarget(caretPosition.getNode(true))) {
            return showCaret(1, caretPosition.getNode(true), false, false);
          }
        }
      }

      return null;
    }

    startContainer = range.startContainer;
    startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // Normalizes <span cE=false>[</span>] to [<span cE=false></span>]
    if (startContainer.nodeType === 3 && startOffset === 0 && isContentEditableFalse(startContainer.parentNode)) {
      startContainer = startContainer.parentNode;
      startOffset = dom.nodeIndex(startContainer);
      startContainer = startContainer.parentNode;
    }

    if (startContainer.nodeType !== 1) {
      return null;
    }

    if (endOffset === startOffset + 1 && startContainer === range.endContainer) {
      node = startContainer.childNodes[startOffset];
    }

    if (!isContentEditableFalse(node)) {
      return null;
    }

    targetClone = origTargetClone = node.cloneNode(true);
    const e = editor.fire('ObjectSelected', { target: node, targetClone });
    if (e.isDefaultPrevented()) {
      return null;
    }

    $realSelectionContainer = SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), '#' + realSelectionId).fold(
      function () {
        return $([]);
      },
      function (elm) {
        return $([ elm.dom() ]);
      }
    );

    targetClone = e.targetClone;
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
      $realSelectionContainer.empty().append(Unicode.nbsp).append(targetClone).append(Unicode.nbsp);
      range.setStart($realSelectionContainer[0].firstChild, 1);
      range.setEnd($realSelectionContainer[0].lastChild, 0);
    }

    $realSelectionContainer.css({
      top: dom.getPos(node, editor.getBody()).y
    });

    $realSelectionContainer[0].focus();
    const sel = editor.selection.getSel();
    sel.removeAllRanges();
    sel.addRange(range);

    // We used to just remove all data-mce-selected values and set 1 on node.
    // But data-mce-selected can be values other than 1 so keep existing value if
    // node has one, and remove data-mce-selected from everything else
    const nodeElm = SugarElement.fromDom(node);
    Arr.each(SelectorFilter.descendants(SugarElement.fromDom(editor.getBody()), '*[data-mce-selected]'), function (elm) {
      if (!Compare.eq(nodeElm, elm)) {
        Attr.remove(elm, 'data-mce-selected');
      }
    });

    if (!editor.dom.getAttrib(node, 'data-mce-selected')) {
      node.setAttribute('data-mce-selected', '1');
    }
    selectedContentEditableNode = node;
    hideFakeCaret();

    return range;
  };

  const removeContentEditableSelection = function () {
    if (selectedContentEditableNode) {
      selectedContentEditableNode.removeAttribute('data-mce-selected');
      SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), '#' + realSelectionId).each(Remove.remove);
      selectedContentEditableNode = null;
    }

    SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), '#' + realSelectionId).each(Remove.remove);
    selectedContentEditableNode = null;
  };

  const destroy = function () {
    fakeCaret.destroy();
    selectedContentEditableNode = null;
  };

  const hideFakeCaret = function () {
    fakeCaret.hide();
  };

  if (Env.ceFalse) {
    registerEvents();
  }

  return {
    showCaret,
    showBlockCaretContainer,
    hideFakeCaret,
    destroy
  };
};

export default SelectionOverrides;
