/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from '../api/dom/DOMUtils';
import ElementUtils from '../api/dom/ElementUtils';
import Editor from '../api/Editor';
import { FormatVars } from '../api/fmt/Format';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as NodeType from '../dom/NodeType';
import { isCaretNode } from '../fmt/FormatContainer';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';
import * as RemoveFormat from './RemoveFormat';

const each = Tools.each;

const isElementNode = function (node: Node) {
  return NodeType.isElement(node) && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);
};

const findElementSibling = function (node: Node, siblingName: 'nextSibling' | 'previousSibling') {
  let sibling;

  for (sibling = node; sibling; sibling = sibling[siblingName]) {
    if (NodeType.isText(sibling) && sibling.nodeValue.length !== 0) {
      return node;
    }

    if (NodeType.isElement(sibling) && !Bookmarks.isBookmarkNode(sibling)) {
      return sibling;
    }
  }

  return node;
};

const mergeSiblingsNodes = function (dom: DOMUtils, prev: Node, next: Node) {
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

const processChildElements = function (node: Node, filter: (node: Node) => boolean, process: (node: Node) => void) {
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

const hasStyle = (dom: DOMUtils, name: string) => (node: Node): boolean =>
  !!(node && FormatUtils.getStyle(dom, node, name));

const applyStyle = (dom: DOMUtils, name: string, value: string) => (node: Element): void => {
  dom.setStyle(node, name, value);

  if (node.getAttribute('style') === '') {
    node.removeAttribute('style');
  }

  unwrapEmptySpan(dom, node);
};

const unwrapEmptySpan = function (dom: DOMUtils, node: Node) {
  if (node.nodeName === 'SPAN' && dom.getAttribs(node).length === 0) {
    dom.remove(node, true);
  }
};

const mergeTextDecorationsAndColor = function (dom: DOMUtils, format, vars: FormatVars, node: Node) {
  const processTextDecorationsAndColor = function (n: Node) {
    if (n.nodeType === 1 && n.parentNode && n.parentNode.nodeType === 1) {
      const textDecoration = FormatUtils.getTextDecoration(dom, n.parentNode);
      if (dom.getStyle(n, 'color') && textDecoration) {
        dom.setStyle(n, 'text-decoration', textDecoration);
      } else if (dom.getStyle(n, 'text-decoration') === textDecoration) {
        dom.setStyle(n, 'text-decoration', null);
      }
    }
  };

  // Colored nodes should be underlined so that the color of the underline matches the text color.
  if (format.styles && (format.styles.color || format.styles.textDecoration)) {
    Tools.walk(node, processTextDecorationsAndColor, 'childNodes');
    processTextDecorationsAndColor(node);
  }
};

const mergeBackgroundColorAndFontSize = function (dom: DOMUtils, format, vars: FormatVars, node: Node) {
  // nodes with font-size should have their own background color as well to fit the line-height (see TINY-882)
  if (format.styles && format.styles.backgroundColor) {
    processChildElements(node,
      hasStyle(dom, 'fontSize'),
      applyStyle(dom, 'backgroundColor', FormatUtils.replaceVars(format.styles.backgroundColor, vars))
    );
  }
};

const mergeSubSup = function (dom: DOMUtils, format, vars: FormatVars, node: Node) {
  // Remove font size on all chilren of a sub/sup and remove the inverse element
  if (format.inline === 'sub' || format.inline === 'sup') {
    processChildElements(node,
      hasStyle(dom, 'fontSize'),
      applyStyle(dom, 'fontSize', '')
    );

    dom.remove(dom.select(format.inline === 'sup' ? 'sub' : 'sup', node), true);
  }
};

const mergeSiblings = function (dom: DOMUtils, format, vars: FormatVars, node: Node) {
  // Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
  if (node && format.merge_siblings !== false) {
    node = mergeSiblingsNodes(dom, FormatUtils.getNonWhiteSpaceSibling(node), node);
    node = mergeSiblingsNodes(dom, node, FormatUtils.getNonWhiteSpaceSibling(node, true));
  }
};

const clearChildStyles = function (dom: DOMUtils, format, node: Node) {
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

const mergeWithChildren = function (editor: Editor, formatList, vars: FormatVars, node: Node) {
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

const mergeWithParents = function (editor: Editor, format, name: string, vars: FormatVars, node: Node) {
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

export {
  mergeWithChildren,
  mergeTextDecorationsAndColor,
  mergeBackgroundColorAndFontSize,
  mergeSubSup,
  mergeSiblings,
  mergeWithParents
};
