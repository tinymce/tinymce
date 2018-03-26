/**
 * MergeFormats.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import Bookmarks from '../dom/Bookmarks';
import ElementUtils from '../api/dom/ElementUtils';
import NodeType from '../dom/NodeType';
import FormatUtils from './FormatUtils';
import MatchFormat from './MatchFormat';
import RemoveFormat from './RemoveFormat';
import Tools from '../api/util/Tools';
import { isCaretNode } from 'tinymce/core/fmt/FormatContainer';

const each = Tools.each;

const isElementNode = function (node) {
  return node && node.nodeType === 1 && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);
};

const findElementSibling = function (node, siblingName) {
  let sibling;

  for (sibling = node; sibling; sibling = sibling[siblingName]) {
    if (sibling.nodeType === 3 && sibling.nodeValue.length !== 0) {
      return node;
    }

    if (sibling.nodeType === 1 && !Bookmarks.isBookmarkNode(sibling)) {
      return sibling;
    }
  }

  return node;
};

const mergeSiblingsNodes = function (dom, prev, next) {
  let sibling, tmpSibling;
  const elementUtils = new ElementUtils(dom);

  // Check if next/prev exists and that they are elements
  if (prev && next) {
    // If previous sibling is empty then jump over it
    prev = findElementSibling(prev, 'previousSibling');
    next = findElementSibling(next, 'nextSibling');

    // Compare next and previous nodes
    if (elementUtils.compare(prev, next)) {
      // Append nodes between
      for (sibling = prev.nextSibling; sibling && sibling !== next;) {
        tmpSibling = sibling;
        sibling = sibling.nextSibling;
        prev.appendChild(tmpSibling);
      }

      dom.remove(next);

      Tools.each(Tools.grep(next.childNodes), function (node) {
        prev.appendChild(node);
      });

      return prev;
    }
  }

  return next;
};

const processChildElements = function (node, filter, process) {
  each(node.childNodes, function (node) {
    if (isElementNode(node)) {
      if (filter(node)) {
        process(node);
      }
      if (node.hasChildNodes()) {
        processChildElements(node, filter, process);
      }
    }
  });
};

const hasStyle = function (dom, name) {
  return Fun.curry(function (name, node) {
    return !!(node && FormatUtils.getStyle(dom, node, name));
  }, name);
};

const applyStyle = function (dom, name, value) {
  return Fun.curry(function (name, value, node) {
    dom.setStyle(node, name, value);

    if (node.getAttribute('style') === '') {
      node.removeAttribute('style');
    }

    unwrapEmptySpan(dom, node);
  }, name, value);
};

const unwrapEmptySpan = function (dom, node) {
  if (node.nodeName === 'SPAN' && dom.getAttribs(node).length === 0) {
    dom.remove(node, true);
  }
};

const processUnderlineAndColor = function (dom, node) {
  let textDecoration;
  if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
    textDecoration = FormatUtils.getTextDecoration(dom, node.parentNode);
    if (dom.getStyle(node, 'color') && textDecoration) {
      dom.setStyle(node, 'text-decoration', textDecoration);
    } else if (dom.getStyle(node, 'text-decoration') === textDecoration) {
      dom.setStyle(node, 'text-decoration', null);
    }
  }
};

const mergeUnderlineAndColor = function (dom, format, vars, node) {
  // Colored nodes should be underlined so that the color of the underline matches the text color.
  if (format.styles.color || format.styles.textDecoration) {
    Tools.walk(node, Fun.curry(processUnderlineAndColor, dom), 'childNodes');
    processUnderlineAndColor(dom, node);
  }
};

const mergeBackgroundColorAndFontSize = function (dom, format, vars, node) {
  // nodes with font-size should have their own background color as well to fit the line-height (see TINY-882)
  if (format.styles && format.styles.backgroundColor) {
    processChildElements(node,
      hasStyle(dom, 'fontSize'),
      applyStyle(dom, 'backgroundColor', FormatUtils.replaceVars(format.styles.backgroundColor, vars))
    );
  }
};

const mergeSubSup = function (dom, format, vars, node) {
  // Remove font size on all chilren of a sub/sup and remove the inverse element
  if (format.inline === 'sub' || format.inline === 'sup') {
    processChildElements(node,
      hasStyle(dom, 'fontSize'),
      applyStyle(dom, 'fontSize', '')
    );

    dom.remove(dom.select(format.inline === 'sup' ? 'sub' : 'sup', node), true);
  }
};

const mergeSiblings = function (dom, format, vars, node) {
  // Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
  if (node && format.merge_siblings !== false) {
    node = mergeSiblingsNodes(dom, FormatUtils.getNonWhiteSpaceSibling(node), node);
    node = mergeSiblingsNodes(dom, node, FormatUtils.getNonWhiteSpaceSibling(node, true));
  }
};

const clearChildStyles = function (dom, format, node) {
  if (format.clear_child_styles) {
    const selector = format.links ? '*:not(a)' : '*';
    each(dom.select(selector, node), function (node) {
      if (isElementNode(node)) {
        each(format.styles, function (value, name) {
          dom.setStyle(node, name, '');
        });
      }
    });
  }
};

const mergeWithChildren = function (editor, formatList, vars, node) {
  // Remove/merge children
  each(formatList, function (format) {
    // Merge all children of similar type will move styles from child to parent
    // this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
    // will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
    each(editor.dom.select(format.inline, node), function (child) {
      if (!isElementNode(child)) {
        return;
      }

      RemoveFormat.removeFormat(editor, format, vars, child, format.exact ? child : null);
    });

    clearChildStyles(editor.dom, format, node);
  });
};

const mergeWithParents = function (editor, format, name, vars, node) {
  // Remove format if direct parent already has the same format
  if (MatchFormat.matchNode(editor, node.parentNode, name, vars)) {
    if (RemoveFormat.removeFormat(editor, format, vars, node)) {
      return;
    }
  }

  // Remove format if any ancestor already has the same format
  if (format.merge_with_parents) {
    editor.dom.getParent(node.parentNode, function (parent) {
      if (MatchFormat.matchNode(editor, parent, name, vars)) {
        RemoveFormat.removeFormat(editor, format, vars, node);
        return true;
      }
    });
  }
};

export default {
  mergeWithChildren,
  mergeUnderlineAndColor,
  mergeBackgroundColorAndFontSize,
  mergeSubSup,
  mergeSiblings,
  mergeWithParents
};