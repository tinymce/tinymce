/**
 * DeleteElement.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun, Option, Strings } from '@ephox/katamari';
import { Insert, Remove, Element, Node as SugarNode, PredicateFind } from '@ephox/sugar';
import * as CaretCandidate from '../caret/CaretCandidate';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import Empty from '../dom/Empty';
import NodeType from '../dom/NodeType';
import { Node } from '@ephox/dom-globals';

const needsReposition = function (pos, elm) {
  const container = pos.container();
  const offset = pos.offset();
  return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
};

const reposition = function (elm, pos) {
  return needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;
};

const beforeOrStartOf = function (node) {
  return NodeType.isText(node) ? CaretPosition(node, 0) : CaretPosition.before(node);
};

const afterOrEndOf = function (node) {
  return NodeType.isText(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);
};

const getPreviousSiblingCaretPosition = function (elm) {
  if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
    return Option.some(afterOrEndOf(elm.previousSibling));
  } else {
    return elm.previousSibling ? CaretFinder.lastPositionIn(elm.previousSibling) : Option.none();
  }
};

const getNextSiblingCaretPosition = function (elm) {
  if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
    return Option.some(beforeOrStartOf(elm.nextSibling));
  } else {
    return elm.nextSibling ? CaretFinder.firstPositionIn(elm.nextSibling) : Option.none();
  }
};

const findCaretPositionBackwardsFromElm = function (rootElement, elm) {
  const startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
  return CaretFinder.prevPosition(rootElement, startPosition).fold(
    function () {
      return CaretFinder.nextPosition(rootElement, CaretPosition.after(elm));
    },
    Option.some
  );
};

const findCaretPositionForwardsFromElm = function (rootElement, elm) {
  return CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)).fold(
    function () {
      return CaretFinder.prevPosition(rootElement, CaretPosition.before(elm));
    },
    Option.some
  );
};

const findCaretPositionBackwards = function (rootElement, elm) {
  return getPreviousSiblingCaretPosition(elm).orThunk(function () {
    return getNextSiblingCaretPosition(elm);
  }).orThunk(function () {
    return findCaretPositionBackwardsFromElm(rootElement, elm);
  });
};

const findCaretPositionForward = function (rootElement, elm) {
  return getNextSiblingCaretPosition(elm).orThunk(function () {
    return getPreviousSiblingCaretPosition(elm);
  }).orThunk(function () {
    return findCaretPositionForwardsFromElm(rootElement, elm);
  });
};

const findCaretPosition = function (forward, rootElement, elm) {
  return forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);
};

const findCaretPosOutsideElmAfterDelete = function (forward, rootElement, elm) {
  return findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));
};

const setSelection = function (editor, forward, pos) {
  pos.fold(
    function () {
      editor.focus();
    },
    function (pos) {
      editor.selection.setRng(pos.toRange(), forward);
    }
  );
};

const eqRawNode = function (rawNode: Node) {
  return function (elm) {
    return elm.dom() === rawNode;
  };
};

const isBlock = function (editor, elm) {
  return elm && editor.schema.getBlockElements().hasOwnProperty(SugarNode.name(elm));
};

const paddEmptyBlock = function (elm) {
  if (Empty.isEmpty(elm)) {
    const br = Element.fromHtml('<br data-mce-bogus="1">');
    Remove.empty(elm);
    Insert.append(elm, br);
    return Option.some(CaretPosition.before(br.dom()));
  } else {
    return Option.none();
  }
};

const isWhitespace = function (c) {
  // Don't compare other unicode spaces here, as we're only concerned about whitespace the browser would collapse
  return ' \f\n\r\t\v'.indexOf(c) !== -1;
};

// normalize the whitespace from the merge, such as <p>a <span></span> b</p> -> <p>a &nsbp;b</p>
// or <p><span></span> a</p> -> <p>&nbsp;a</a>
const normalizeWhitespace = function (node, forward: boolean, offset: number) {
  let start, whitespaceCount, content;
  if (forward) {
    content = node.data.slice(offset);
    whitespaceCount = content.length - Strings.lTrim(content).length;
    start = offset;
  } else {
    content = node.data.slice(0, offset);
    whitespaceCount = content.length - Strings.rTrim(content).length;
    start = offset - whitespaceCount;
  }

  if (whitespaceCount === 0) {
    return;
  }

  // Get the whitespace
  let whitespace = node.data.slice(start, start + whitespaceCount);

  // Regenerate the whitespace ensuring to alternate between a space and nbsp
  const isEndOfContent = start + whitespaceCount >= node.data.length;
  const isStartOfContent = start === 0;
  let previousCharIsSpace = false;
  whitespace = Arr.map(whitespace.split(""), (c, count) => {
    // Are we dealing with a char other than a space or nbsp? if so then just use it as is
    if (!isWhitespace(c) && c !== '\u00a0') {
      previousCharIsSpace = false;
      return c;
    } else {
      if (previousCharIsSpace || (count === 0 && isStartOfContent) || (count === whitespace.length - 1 && isEndOfContent)) {
        previousCharIsSpace = false;
        return '\u00a0';
      } else {
        previousCharIsSpace = true;
        return ' ';
      }
    }
  }).join("");

  // Replace the original whitespace with the normalized whitespace content
  node.replaceData(start, whitespaceCount, whitespace);
};


const deleteNormalized = function (elm: Element, afterDeletePosOpt: Option<CaretPosition>, normalizeWhitespaces?: boolean) {
  return afterDeletePosOpt.map(
    (pos) => {
      const node = elm.dom();
      const prevNode = node.previousSibling, nextNode = node.nextSibling;
      const hasPrevTextNode = NodeType.isText(prevNode);
      const hasNextTextNode = NodeType.isText(nextNode);

      // Fix any whitespace issues by ensuring the next/previous text nodes are correctly padded
      if (hasPrevTextNode && hasNextTextNode) {
        let offset = prevNode.data.length;
        let whitespaceOffset = Strings.rTrim(prevNode.data).length;
        // Merge the elements
        prevNode.appendData(nextNode.data);
        Remove.remove(Element.fromDom(nextNode));
        // Normalize the whitespace around the merged elements, to ensure it doesn't get lost
        if (normalizeWhitespaces) {
          normalizeWhitespace(prevNode, true, whitespaceOffset);
        }
        // Update the cursor position
        if (pos.container() === prevNode || pos.container() === nextNode) {
          pos = CaretPosition(prevNode, offset);
        }
      } else if (hasPrevTextNode && normalizeWhitespaces) {
        // Normalize the whitespace at the end and ensure that it doesn't end with a space
        normalizeWhitespace(prevNode, false, prevNode.data.length);
      } else if (hasNextTextNode && normalizeWhitespaces) {
        // Normalize the whitespace at the start of the node
        normalizeWhitespace(nextNode, true, 0);
      }

      return pos;
    }
  );
};

const isInlineElement = function (editor, element: Element) {
  const inlineElements = editor.schema.getTextInlineElements();
  return inlineElements.hasOwnProperty(SugarNode.name(element));
};

const deleteElement = function (editor, forward: boolean, elm: Element, moveCaret?: boolean) {
  const afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom());
  const parentBlock = PredicateFind.ancestor(elm, Fun.curry(isBlock, editor), eqRawNode(editor.getBody()));
  const normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos, isInlineElement(editor, elm));

  // Delete the element
  Remove.remove(elm);

  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    editor.selection.setCursorLocation();
  } else {
    parentBlock.bind(paddEmptyBlock).fold(
      function () {
        if (moveCaret !== false) {
          setSelection(editor, forward, normalizedAfterDeletePos);
        }
      },
      function (paddPos) {
        if (moveCaret !== false) {
          setSelection(editor, forward, Option.some(paddPos));
        }
      }
    );
  }
};

export default {
  deleteElement
};