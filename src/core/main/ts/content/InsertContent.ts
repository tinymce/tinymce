/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Element as DomElement } from '@ephox/dom-globals';
import Env from '../api/Env';
import InsertList from './InsertList';
import CaretPosition from '../caret/CaretPosition';
import { CaretWalker } from '../caret/CaretWalker';
import ElementUtils from '../api/dom/ElementUtils';
import NodeType from '../dom/NodeType';
import PaddingBr from '../dom/PaddingBr';
import Serializer from '../api/html/Serializer';
import RangeNormalizer from '../selection/RangeNormalizer';
import Tools from '../api/util/Tools';
import { Selection } from '../api/dom/Selection';
import { Editor } from 'tinymce/core/api/Editor';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';
import { trimOrPadLeftRight, trimNbspAfterDeleteAndPadValue, isAfterNbsp } from 'tinymce/core/content/NbspTrim';
import { default as ParserNode } from 'tinymce/core/api/html/Node';

const isTableCell = NodeType.matchNodeNames('td th');

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
    if (!node || (node === node2 && node.nodeName === 'BR')) {///
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

const umarkFragmentElements = (elm: DomElement) => {
  Tools.each(elm.getElementsByTagName('*'), (elm) => {
    elm.removeAttribute('data-mce-fragment');
  });
};

const isPartOfFragment = function (node) {
  return !!node.getAttribute('data-mce-fragment');
};

const canHaveChildren = function (editor, node) {
  return node && !editor.schema.getShortEndedElements()[node.nodeName];
};

const moveSelectionToMarker = function (editor, marker) {
  let parentEditableFalseElm, parentBlock, nextRng;
  const dom = editor.dom, selection = editor.selection;
  let node, node2;

  const getContentEditableFalseParent = function (node) {
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
  parentEditableFalseElm = getContentEditableFalseParent(marker);
  if (parentEditableFalseElm) {
    dom.remove(marker);
    selection.select(parentEditableFalseElm);
    return;
  }

  // Move selection before marker and remove it
  let rng = dom.createRng();

  // If previous sibling is a text node set the selection to the end of that node
  node = marker.previousSibling;
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
  parentBlock = dom.getParent(marker, dom.isBlock);
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

const insertHtmlAtCaret = function (editor: Editor, value: string, details) {
  let parser, serializer, parentNode, rootNode, fragment, args;
  let marker, rng, node, bookmarkHtml, merge;
  const selection: Selection = editor.selection, dom = editor.dom;

  // Check for whitespace before/after value
  if (/^ | $/.test(value)) {
    value = trimOrPadLeftRight(selection.getRng(), value);
  }

  // Setup parser and serializer
  parser = editor.parser;
  merge = details.merge;

  serializer = Serializer({
    validate: editor.settings.validate
  }, editor.schema);
  bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#x200B;</span>';

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
    // Fix for #2595 seems that delete removes one extra character on
    // WebKit for some odd reason if you double click select a word
    editor.selection.setRng(RangeNormalizer.normalize(editor.selection.getRng()));
    editor.getDoc().execCommand('Delete', false, null);
    value = trimNbspAfterDeleteAndPadValue(editor.selection.getRng(), value);
  }

  parentNode = selection.getNode();

  // Parse the fragment within the context of the parent node
  const parserArgs: any = { context: parentNode.nodeName.toLowerCase(), data: details.data, insert: true };
  fragment = parser.parse(value, parserArgs);

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
  umarkFragmentElements(editor.getBody());
  trimBrsFromTableCell(editor.dom, editor.selection.getStart());

  editor.fire('SetContent', args);
  editor.addVisual();
};

const processValue = function (value) {
  let details;

  if (typeof value !== 'string') {
    details = Tools.extend({
      paste: value.paste,
      data: {
        paste: value.paste
      }
    }, value);

    return {
      content: value.content,
      details
    };
  }

  return {
    content: value,
    details: {}
  };
};

const insertAtCaret = function (editor, value) {
  const result = processValue(value);
  insertHtmlAtCaret(editor, result.content, result.details);
};

export default {
  insertAtCaret
};