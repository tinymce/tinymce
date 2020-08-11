/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import { FormatVars } from '../api/fmt/Format';
import Tools from '../api/util/Tools';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';
import { applyStyle, clearChildStyles, hasStyle, isElementNode, mergeSiblings, processChildElements } from './MergeUtils';
import * as RemoveFormat from './RemoveFormat';

const each = Tools.each;

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
  // Remove font size on all children of a sub/sup and remove the inverse element
  if (format.inline === 'sub' || format.inline === 'sup') {
    processChildElements(node,
      hasStyle(dom, 'fontSize'),
      applyStyle(dom, 'fontSize', '')
    );

    dom.remove(dom.select(format.inline === 'sup' ? 'sub' : 'sup', node), true);
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
