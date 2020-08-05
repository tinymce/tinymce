/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Document, Node, Range } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Option, Strings } from '@ephox/katamari';
import { Attr, Element, Insert, Node as SugarNode, Remove } from '@ephox/sugar';
import TreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import { FormatVars } from '../api/fmt/Format';
import CaretPosition from '../caret/CaretPosition';
import * as DeleteElement from '../delete/DeleteElement';
import * as NodeType from '../dom/NodeType';
import * as PaddingBr from '../dom/PaddingBr';
import * as SplitRange from '../selection/SplitRange';
import * as Zwsp from '../text/Zwsp';
import * as ExpandRange from './ExpandRange';
import { getParentCaretContainer, isCaretNode } from './FormatContainer';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

const ZWSP = Zwsp.ZWSP, CARET_ID = '_mce_caret';

const importNode = function (ownerDocument: Document, node: Node) {
  return ownerDocument.importNode(node, true);
};

const getEmptyCaretContainers = function (node: Node) {
  const nodes: Node[] = [];

  while (node) {
    if ((node.nodeType === 3 && node.nodeValue !== ZWSP) || node.childNodes.length > 1) {
      return [];
    }

    // Collect nodes
    if (node.nodeType === 1) {
      nodes.push(node);
    }

    node = node.firstChild;
  }

  return nodes;
};

const isCaretContainerEmpty = function (node: Node) {
  return getEmptyCaretContainers(node).length > 0;
};

const findFirstTextNode = function (node: Node) {
  if (node) {
    const walker = new TreeWalker(node, node);

    for (node = walker.current(); node; node = walker.next()) {
      if (NodeType.isText(node)) {
        return node;
      }
    }
  }

  return null;
};

const createCaretContainer = function (fill: boolean) {
  const caretContainer = Element.fromTag('span');

  Attr.setAll(caretContainer, {
    // style: 'color:red',
    'id': CARET_ID,
    'data-mce-bogus': '1',
    'data-mce-type': 'format-caret'
  });

  if (fill) {
    Insert.append(caretContainer, Element.fromText(ZWSP));
  }

  return caretContainer;
};

const trimZwspFromCaretContainer = function (caretContainerNode: Node) {
  const textNode = findFirstTextNode(caretContainerNode);
  if (textNode && textNode.nodeValue.charAt(0) === ZWSP) {
    textNode.deleteData(0, 1);
  }

  return textNode;
};

const removeCaretContainerNode = (editor: Editor, node: Node, moveCaret: boolean = true) => {
  const dom = editor.dom, selection = editor.selection;

  if (isCaretContainerEmpty(node)) {
    DeleteElement.deleteElement(editor, false, Element.fromDom(node), moveCaret);
  } else {
    const rng = selection.getRng();
    const block = dom.getParent(node, dom.isBlock);

    // Store the current selection offsets
    const startContainer = rng.startContainer;
    const startOffset = rng.startOffset;
    const endContainer = rng.endContainer;
    const endOffset = rng.endOffset;

    const textNode = trimZwspFromCaretContainer(node);
    dom.remove(node, true);

    // Restore the selection after unwrapping the node and removing the zwsp
    if (startContainer === textNode && startOffset > 0) {
      rng.setStart(textNode, startOffset - 1);
    }

    if (endContainer === textNode && endOffset > 0) {
      rng.setEnd(textNode, endOffset - 1);
    }

    if (block && dom.isEmpty(block)) {
      PaddingBr.fillWithPaddingBr(Element.fromDom(block));
    }

    selection.setRng(rng);
  }
};

// Removes the caret container for the specified node or all on the current document
const removeCaretContainer = function (editor: Editor, node: Node, moveCaret: boolean = true) {
  const dom = editor.dom, selection = editor.selection;
  if (!node) {
    node = getParentCaretContainer(editor.getBody(), selection.getStart());

    if (!node) {
      while ((node = dom.get(CARET_ID))) {
        removeCaretContainerNode(editor, node, false);
      }
    }
  } else {
    removeCaretContainerNode(editor, node, moveCaret);
  }
};

const insertCaretContainerNode = function (editor: Editor, caretContainer: Node, formatNode: Node) {
  const dom = editor.dom, block = dom.getParent(formatNode, Fun.curry(FormatUtils.isTextBlock, editor));

  if (block && dom.isEmpty(block)) {
    // Replace formatNode with caretContainer when removing format from empty block like <p><b>|</b></p>
    formatNode.parentNode.replaceChild(caretContainer, formatNode);
  } else {
    PaddingBr.removeTrailingBr(Element.fromDom(formatNode));
    if (dom.isEmpty(formatNode)) {
      formatNode.parentNode.replaceChild(caretContainer, formatNode);
    } else {
      dom.insertAfter(caretContainer, formatNode);
    }
  }
};

const appendNode = function (parentNode: Node, node: Node) {
  parentNode.appendChild(node);
  return node;
};

const insertFormatNodesIntoCaretContainer = function (formatNodes: Node[], caretContainer: Node) {
  const innerMostFormatNode = Arr.foldr(formatNodes, function (parentNode, formatNode) {
    return appendNode(parentNode, formatNode.cloneNode(false));
  }, caretContainer);

  return appendNode(innerMostFormatNode, innerMostFormatNode.ownerDocument.createTextNode(ZWSP));
};

const cleanFormatNode = (editor: Editor, caretContainer: Node, formatNode: Node, name: string, vars: FormatVars, similar: boolean): Option<Node> => {
  const formatter = editor.formatter;
  const dom = editor.dom;

  // Find all formats present on the format node
  const validFormats = Arr.filter(Obj.keys(formatter.get()), (formatName) => formatName !== name && !Strings.contains(formatName, 'removeformat'));
  const matchedFormats = MatchFormat.matchAllOnNode(editor, formatNode, validFormats);
  // Filter out any matched formats that are 'visually' equivalent to the 'name' format since they are not unique formats on the node
  const uniqueFormats = Arr.filter(matchedFormats, (fmtName) => !FormatUtils.areSimilarFormats(editor, fmtName, name));

  // If more than one format is present, then there's additional formats that should be retained. So clone the node,
  // remove the format and then return cleaned format node
  if (uniqueFormats.length > 0) {
    const clonedFormatNode = formatNode.cloneNode(false);
    dom.add(caretContainer, clonedFormatNode);
    formatter.remove(name, vars, clonedFormatNode, similar);
    dom.remove(clonedFormatNode);
    return Option.some(clonedFormatNode);
  } else {
    return Option.none();
  }
};

const applyCaretFormat = function (editor: Editor, name: string, vars: FormatVars) {
  let caretContainer: Node, textNode: Node;
  const selection = editor.selection;

  const selectionRng = selection.getRng();
  let offset = selectionRng.startOffset;
  const container = selectionRng.startContainer;
  const text = container.nodeValue;

  caretContainer = getParentCaretContainer(editor.getBody(), selection.getStart());
  if (caretContainer) {
    textNode = findFirstTextNode(caretContainer);
  }

  // Expand to word if caret is in the middle of a text node and the char before/after is a alpha numeric character
  const wordcharRegex = /[^\s\u00a0\u00ad\u200b\ufeff]/;
  if (text && offset > 0 && offset < text.length &&
    wordcharRegex.test(text.charAt(offset)) && wordcharRegex.test(text.charAt(offset - 1))) {
    // Get bookmark of caret position
    const bookmark = selection.getBookmark();

    // Collapse bookmark range (WebKit)
    selectionRng.collapse(true);

    // Expand the range to the closest word and split it at those points
    let rng = ExpandRange.expandRng(editor, selectionRng, editor.formatter.get(name));
    rng = SplitRange.split(rng);

    // Apply the format to the range
    editor.formatter.apply(name, vars, rng);

    // Move selection back to caret position
    selection.moveToBookmark(bookmark);
  } else {
    if (!caretContainer || textNode.nodeValue !== ZWSP) {
      // Need to import the node into the document on IE or we get a lovely WrongDocument exception
      caretContainer = importNode(editor.getDoc(), createCaretContainer(true).dom());
      textNode = caretContainer.firstChild;

      selectionRng.insertNode(caretContainer);
      offset = 1;

      editor.formatter.apply(name, vars, caretContainer);
    } else {
      editor.formatter.apply(name, vars, caretContainer);
    }

    // Move selection to text node
    selection.setCursorLocation(textNode, offset);
  }
};

const removeCaretFormat = function (editor: Editor, name: string, vars: FormatVars, similar: boolean) {
  const dom = editor.dom;
  const selection = editor.selection;
  let hasContentAfter: boolean, node: Node, formatNode: Node;
  const parents: Node[] = [];
  const rng = selection.getRng();

  const container = rng.startContainer;
  const offset = rng.startOffset;
  node = container;

  if (container.nodeType === 3) {
    if (offset !== container.nodeValue.length) {
      hasContentAfter = true;
    }

    node = node.parentNode;
  }

  while (node) {
    if (MatchFormat.matchNode(editor, node, name, vars, similar)) {
      formatNode = node;
      break;
    }

    if (node.nextSibling) {
      hasContentAfter = true;
    }

    parents.push(node);
    node = node.parentNode;
  }

  // Node doesn't have the specified format
  if (!formatNode) {
    return;
  }

  // Is there contents after the caret then remove the format on the element
  if (hasContentAfter) {
    const bookmark = selection.getBookmark();

    // Collapse bookmark range (WebKit)
    rng.collapse(true);

    // Expand the range to the closest word and split it at those points
    let expandedRng = ExpandRange.expandRng(editor, rng, editor.formatter.get(name), true);
    expandedRng = SplitRange.split(expandedRng);

    // TODO: Figure out how on earth this works, as it shouldn't since remove format
    //  definitely seems to require an actual Range
    editor.formatter.remove(name, vars, expandedRng as Range, similar);
    selection.moveToBookmark(bookmark);
  } else {
    const caretContainer = getParentCaretContainer(editor.getBody(), formatNode);
    const newCaretContainer = createCaretContainer(false).dom();

    insertCaretContainerNode(editor, newCaretContainer, caretContainer !== null ? caretContainer : formatNode);

    const cleanedFormatNode = cleanFormatNode(editor, newCaretContainer, formatNode, name, vars, similar);
    const caretTextNode = insertFormatNodesIntoCaretContainer(parents.concat(cleanedFormatNode.toArray()), newCaretContainer);

    removeCaretContainerNode(editor, caretContainer, false);
    selection.setCursorLocation(caretTextNode, 1);

    if (dom.isEmpty(formatNode)) {
      dom.remove(formatNode);
    }
  }
};

const disableCaretContainer = function (editor: Editor, keyCode: number) {
  const selection = editor.selection, body = editor.getBody();

  removeCaretContainer(editor, null, false);

  // Remove caret container if it's empty
  if ((keyCode === 8 || keyCode === 46) && selection.isCollapsed() && selection.getStart().innerHTML === ZWSP) {
    removeCaretContainer(editor, getParentCaretContainer(body, selection.getStart()));
  }

  // Remove caret container on keydown and it's left/right arrow keys
  if (keyCode === 37 || keyCode === 39) {
    removeCaretContainer(editor, getParentCaretContainer(body, selection.getStart()));
  }
};

const setup = function (editor: Editor) {
  editor.on('mouseup keydown', function (e) {
    disableCaretContainer(editor, e.keyCode);
  });
};

const replaceWithCaretFormat = function (targetNode: Node, formatNodes: Node[]) {
  const caretContainer = createCaretContainer(false);
  const innerMost = insertFormatNodesIntoCaretContainer(formatNodes, caretContainer.dom());
  Insert.before(Element.fromDom(targetNode), caretContainer);
  Remove.remove(Element.fromDom(targetNode));

  return CaretPosition(innerMost, 0);
};

const isFormatElement = function (editor: Editor, element: Element) {
  const inlineElements = editor.schema.getTextInlineElements();
  return inlineElements.hasOwnProperty(SugarNode.name(element)) && !isCaretNode(element.dom()) && !NodeType.isBogus(element.dom());
};

const isEmptyCaretFormatElement = function (element: Element) {
  return isCaretNode(element.dom()) && isCaretContainerEmpty(element.dom());
};

export {
  setup,
  applyCaretFormat,
  removeCaretFormat,
  replaceWithCaretFormat,
  isFormatElement,
  isEmptyCaretFormatElement
};
