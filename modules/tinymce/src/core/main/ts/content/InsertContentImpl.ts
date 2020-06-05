/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DomElement, Node, Range } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import ElementUtils from '../api/dom/ElementUtils';
import Selection from '../api/dom/Selection';
import Editor from '../api/Editor';
import Env from '../api/Env';
import ParserNode from '../api/html/Node';
import Serializer from '../api/html/Serializer';
import Tools from '../api/util/Tools';
import CaretPosition from '../caret/CaretPosition';
import { CaretWalker } from '../caret/CaretWalker';
import * as TableDelete from '../delete/TableDelete';
import * as NodeType from '../dom/NodeType';
import * as PaddingBr from '../dom/PaddingBr';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as InsertList from './InsertList';
import * as Settings from '../api/Settings';
import { isAfterNbsp, trimNbspAfterDeleteAndPadValue, trimOrPadLeftRight } from './NbspTrim';

const isTableCell = NodeType.matchNodeNames([ 'td', 'th' ]);

const isTableCellContentSelected = (dom: DOMUtils, rng: Range, cell: Node | null) => {
  if (cell !== null) {
    const endCell = dom.getParent(rng.endContainer, isTableCell);
    return cell === endCell && SelectionUtils.hasAllContentsSelected(Element.fromDom(cell), rng);
  } else {
    return false;
  }
};

const selectionSetContent = (editor: Editor, content: string) => {
  const rng = editor.selection.getRng();
  const container = rng.startContainer;
  const offset = rng.startOffset;

  if (rng.collapsed && isAfterNbsp(container, offset) && NodeType.isText(container)) {
    container.insertData(offset - 1, ' ');
    container.deleteData(offset, 1);
    rng.setStart(container, offset);
    rng.setEnd(container, offset);
    editor.selection.setRng(rng);
  }

  editor.selection.setContent(content);
};

const validInsertion = function (editor: Editor, value: string, parentNode: DomElement) {
  // Should never insert content into bogus elements, since these can
  // be resize handles or similar
  if (parentNode.getAttribute('data-mce-bogus') === 'all') {
    parentNode.parentNode.insertBefore(editor.dom.createFragment(value), parentNode);
  } else {
    // Check if parent is empty or only has one BR element then set the innerHTML of that parent
    const node = parentNode.firstChild;
    const node2 = parentNode.lastChild;
    if (!node || (node === node2 && node.nodeName === 'BR')) {
      editor.dom.setHTML(parentNode, value);
    } else {
      selectionSetContent(editor, value);
    }
  }
};

const trimBrsFromTableCell = function (dom: DOMUtils, elm: DomElement) {
  Option.from(dom.getParent(elm, 'td,th')).map(Element.fromDom).each(PaddingBr.trimBlockTrailingBr);
};

const reduceInlineTextElements = (editor: Editor, merge: boolean) => {
  const textInlineElements = editor.schema.getTextInlineElements();
  const dom = editor.dom;

  if (merge) {
    const root = editor.getBody(), elementUtils = new ElementUtils(dom);

    Tools.each(dom.select('*[data-mce-fragment]'), function (node) {
      for (let testNode = node.parentNode; testNode && testNode !== root; testNode = testNode.parentNode) {
        if (textInlineElements[node.nodeName.toLowerCase()] && elementUtils.compare(testNode, node)) {
          dom.remove(node, true);
        }
      }
    });
  }
};

const markFragmentElements = (fragment: ParserNode) => {
  let node = fragment;

  while ((node = node.walk())) {
    if (node.type === 1) {
      node.attr('data-mce-fragment', '1');
    }
  }
};

const unmarkFragmentElements = (elm: DomElement) => {
  Tools.each(elm.getElementsByTagName('*'), (elm: DomElement) => {
    elm.removeAttribute('data-mce-fragment');
  });
};

const isPartOfFragment = function (node: DomElement) {
  return !!node.getAttribute('data-mce-fragment');
};

const canHaveChildren = function (editor: Editor, node) {
  return node && !editor.schema.getShortEndedElements()[node.nodeName];
};

const moveSelectionToMarker = function (editor: Editor, marker) {
  let nextRng;
  const dom = editor.dom, selection = editor.selection;
  let node2;

  const getContentEditableFalseParent = function (node: Node) {
    const root = editor.getBody();

    for (; node && node !== root; node = node.parentNode) {
      if (editor.dom.getContentEditable(node) === 'false') {
        return node;
      }
    }

    return null;
  };

  if (!marker) {
    return;
  }

  editor.selection.scrollIntoView(marker);

  // If marker is in cE=false then move selection to that element instead
  const parentEditableFalseElm = getContentEditableFalseParent(marker);
  if (parentEditableFalseElm) {
    dom.remove(marker);
    selection.select(parentEditableFalseElm);
    return;
  }

  // Move selection before marker and remove it
  let rng = dom.createRng();

  // If previous sibling is a text node set the selection to the end of that node
  const node = marker.previousSibling;
  if (node && node.nodeType === 3) {
    rng.setStart(node, node.nodeValue.length);

    // TODO: Why can't we normalize on IE
    if (!Env.ie) {
      node2 = marker.nextSibling;
      if (node2 && node2.nodeType === 3) {
        node.appendData(node2.data);
        node2.parentNode.removeChild(node2);
      }
    }
  } else {
    // If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
    rng.setStartBefore(marker);
    rng.setEndBefore(marker);
  }

  const findNextCaretRng = function (rng) {
    let caretPos = CaretPosition.fromRangeStart(rng);
    const caretWalker = CaretWalker(editor.getBody());

    caretPos = caretWalker.next(caretPos);
    if (caretPos) {
      return caretPos.toRange();
    }
  };

  // Remove the marker node and set the new range
  const parentBlock = dom.getParent(marker, dom.isBlock);
  dom.remove(marker);

  if (parentBlock && dom.isEmpty(parentBlock)) {
    editor.$(parentBlock).empty();

    rng.setStart(parentBlock, 0);
    rng.setEnd(parentBlock, 0);

    if (!isTableCell(parentBlock) && !isPartOfFragment(parentBlock) && (nextRng = findNextCaretRng(rng))) {
      rng = nextRng;
      dom.remove(parentBlock);
    } else {
      dom.add(parentBlock, dom.create('br', { 'data-mce-bogus': '1' }));
    }
  }

  selection.setRng(rng);
};

const deleteSelectedContent = (editor: Editor) => {
  const dom = editor.dom;
  // Fix for #2595 seems that delete removes one extra character on
  // WebKit for some odd reason if you double click select a word
  const rng = RangeNormalizer.normalize(editor.selection.getRng());
  editor.selection.setRng(rng);
  // TINY-1044: Selecting all content in a single table cell will cause the entire table to be deleted
  // when using the native delete command. As such we need to manually delete the cell content instead
  const startCell = dom.getParent(rng.startContainer, isTableCell);
  if (isTableCellContentSelected(dom, rng, startCell)) {
    TableDelete.deleteCellContents(editor, rng, Element.fromDom(startCell));
  } else {
    editor.getDoc().execCommand('Delete', false, null);
  }
};

export const insertHtmlAtCaret = function (editor: Editor, value: string, details) {
  let parentNode, rootNode, args;
  let marker, rng, node;
  const selection: Selection = editor.selection, dom = editor.dom;

  // Check for whitespace before/after value
  if (/^ | $/.test(value)) {
    value = trimOrPadLeftRight(selection.getRng(), value);
  }

  // Setup parser and serializer
  const parser = editor.parser;
  const merge = details.merge;

  const serializer = Serializer({
    validate: Settings.shouldValidate(editor)
  }, editor.schema);
  const bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#x200B;</span>';

  // Run beforeSetContent handlers on the HTML to be inserted
  args = { content: value, format: 'html', selection: true, paste: details.paste };
  args = editor.fire('BeforeSetContent', args);
  if (args.isDefaultPrevented()) {
    editor.fire('SetContent', { content: args.content, format: 'html', selection: true, paste: details.paste });
    return;
  }

  value = args.content;

  // Add caret at end of contents if it's missing
  if (value.indexOf('{$caret}') === -1) {
    value += '{$caret}';
  }

  // Replace the caret marker with a span bookmark element
  value = value.replace(/\{\$caret\}/, bookmarkHtml);

  // If selection is at <body>|<p></p> then move it into <body><p>|</p>
  rng = selection.getRng();
  const caretElement = rng.startContainer || (rng.parentElement ? rng.parentElement() : null);
  const body = editor.getBody();
  if (caretElement === body && selection.isCollapsed()) {
    if (dom.isBlock(body.firstChild) && canHaveChildren(editor, body.firstChild) && dom.isEmpty(body.firstChild)) {
      rng = dom.createRng();
      rng.setStart(body.firstChild, 0);
      rng.setEnd(body.firstChild, 0);
      selection.setRng(rng);
    }
  }

  // Insert node maker where we will insert the new HTML and get it's parent
  if (!selection.isCollapsed()) {
    deleteSelectedContent(editor);
    value = trimNbspAfterDeleteAndPadValue(editor.selection.getRng(), value);
  }

  parentNode = selection.getNode();

  // Parse the fragment within the context of the parent node
  const parserArgs: any = { context: parentNode.nodeName.toLowerCase(), data: details.data, insert: true };
  const fragment = parser.parse(value, parserArgs);

  // Custom handling of lists
  if (details.paste === true && InsertList.isListFragment(editor.schema, fragment) && InsertList.isParentBlockLi(dom, parentNode)) {
    rng = InsertList.insertAtCaret(serializer, dom, editor.selection.getRng(), fragment);
    editor.selection.setRng(rng);
    editor.fire('SetContent', args);
    return;
  }

  markFragmentElements(fragment);

  // Move the caret to a more suitable location
  node = fragment.lastChild;
  if (node.attr('id') === 'mce_marker') {
    marker = node;

    for (node = node.prev; node; node = node.walk(true)) {
      if (node.type === 3 || !dom.isBlock(node.name)) {
        if (editor.schema.isValidChild(node.parent.name, 'span')) {
          node.parent.insert(marker, node, node.name === 'br');
        }
        break;
      }
    }
  }

  editor._selectionOverrides.showBlockCaretContainer(parentNode);

  // If parser says valid we can insert the contents into that parent
  if (!parserArgs.invalid) {
    value = serializer.serialize(fragment);
    validInsertion(editor, value, parentNode);
  } else {
    // If the fragment was invalid within that context then we need
    // to parse and process the parent it's inserted into

    // Insert bookmark node and get the parent
    selectionSetContent(editor, bookmarkHtml);
    parentNode = selection.getNode();
    rootNode = editor.getBody();

    // Opera will return the document node when selection is in root
    if (parentNode.nodeType === 9) {
      parentNode = node = rootNode;
    } else {
      node = parentNode;
    }

    // Find the ancestor just before the root element
    while (node !== rootNode) {
      parentNode = node;
      node = node.parentNode;
    }

    // Get the outer/inner HTML depending on if we are in the root and parser and serialize that
    value = parentNode === rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
    value = serializer.serialize(
      parser.parse(
        // Need to replace by using a function since $ in the contents would otherwise be a problem
        value.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i, function () {
          return serializer.serialize(fragment);
        })
      )
    );

    // Set the inner/outer HTML depending on if we are in the root or not
    if (parentNode === rootNode) {
      dom.setHTML(rootNode, value);
    } else {
      dom.setOuterHTML(parentNode, value);
    }
  }

  reduceInlineTextElements(editor, merge);
  moveSelectionToMarker(editor, dom.get('mce_marker'));
  unmarkFragmentElements(editor.getBody());
  trimBrsFromTableCell(editor.dom, editor.selection.getStart());

  editor.fire('SetContent', args);
  editor.addVisual();
};
