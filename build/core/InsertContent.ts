/**
 * InsertContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Env from './api/Env';
import InsertList from './InsertList';
import CaretPosition from './caret/CaretPosition';
import { CaretWalker } from './caret/CaretWalker';
import ElementUtils from './api/dom/ElementUtils';
import NodeType from './dom/NodeType';
import PaddingBr from './dom/PaddingBr';
import Serializer from './api/html/Serializer';
import RangeNormalizer from './selection/RangeNormalizer';
import Tools from './api/util/Tools';
import { Selection } from './api/dom/Selection';
import { Editor } from 'tinymce/core/api/Editor';

/**
 * Handles inserts of contents into the editor instance.
 *
 * @class tinymce.InsertContent
 * @private
 */

const isTableCell = NodeType.matchNodeNames('td th');

const validInsertion = function (editor: Editor, value, parentNode) {
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
      editor.selection.setContent(value);
    }
  }
};

const trimBrsFromTableCell = function (dom, elm) {
  Option.from(dom.getParent(elm, 'td,th')).map(Element.fromDom).each(PaddingBr.trimBlockTrailingBr);
};

const insertHtmlAtCaret = function (editor: Editor, value, details) {
  let parser, serializer, parentNode, rootNode, fragment, args;
  let marker, rng, node, node2, bookmarkHtml, merge;
  const textInlineElements = editor.schema.getTextInlineElements();
  const selection: Selection = editor.selection, dom = editor.dom;

  const trimOrPaddLeftRight = function (html) {
    let rng, container, offset;

    rng = selection.getRng();
    container = rng.startContainer;
    offset = rng.startOffset;

    const hasSiblingText = function (siblingName) {
      return container[siblingName] && container[siblingName].nodeType === 3;
    };

    if (container.nodeType === 3) {
      if (offset > 0) {
        html = html.replace(/^&nbsp;/, ' ');
      } else if (!hasSiblingText('previousSibling')) {
        html = html.replace(/^ /, '&nbsp;');
      }

      if (offset < container.length) {
        html = html.replace(/&nbsp;(<br>|)$/, ' ');
      } else if (!hasSiblingText('nextSibling')) {
        html = html.replace(/(&nbsp;| )(<br>|)$/, '&nbsp;');
      }
    }

    return html;
  };

  // Removes &nbsp; from a [b] c -> a &nbsp;c -> a c
  const trimNbspAfterDeleteAndPaddValue = function () {
    let rng, container, offset;

    rng = selection.getRng();
    container = rng.startContainer;
    offset = rng.startOffset;

    if (container.nodeType === 3 && rng.collapsed) {
      if (container.data[offset] === '\u00a0') {
        container.deleteData(offset, 1);

        if (!/[\u00a0| ]$/.test(value)) {
          value += ' ';
        }
      } else if (container.data[offset - 1] === '\u00a0') {
        container.deleteData(offset - 1, 1);

        if (!/[\u00a0| ]$/.test(value)) {
          value = ' ' + value;
        }
      }
    }
  };

  const reduceInlineTextElements = function () {
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

  const markFragmentElements = function (fragment) {
    let node = fragment;

    while ((node = node.walk())) {
      if (node.type === 1) {
        node.attr('data-mce-fragment', '1');
      }
    }
  };

  const umarkFragmentElements = function (elm) {
    Tools.each(elm.getElementsByTagName('*'), function (elm) {
      elm.removeAttribute('data-mce-fragment');
    });
  };

  const isPartOfFragment = function (node) {
    return !!node.getAttribute('data-mce-fragment');
  };

  const canHaveChildren = function (node) {
    return node && !editor.schema.getShortEndedElements()[node.nodeName];
  };

  const moveSelectionToMarker = function (marker) {
    let parentEditableFalseElm, parentBlock, nextRng;

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

    selection.scrollIntoView(marker);

    // If marker is in cE=false then move selection to that element instead
    parentEditableFalseElm = getContentEditableFalseParent(marker);
    if (parentEditableFalseElm) {
      dom.remove(marker);
      selection.select(parentEditableFalseElm);
      return;
    }

    // Move selection before marker and remove it
    rng = dom.createRng();

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

  // Check for whitespace before/after value
  if (/^ | $/.test(value)) {
    value = trimOrPaddLeftRight(value);
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
    if (dom.isBlock(body.firstChild) && canHaveChildren(body.firstChild) && dom.isEmpty(body.firstChild)) {
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
    trimNbspAfterDeleteAndPaddValue();
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
    selection.setContent(bookmarkHtml);
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

  reduceInlineTextElements();
  moveSelectionToMarker(dom.get('mce_marker'));
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