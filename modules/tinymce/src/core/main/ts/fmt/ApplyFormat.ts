/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import DOMUtils from '../api/dom/DOMUtils';
import Selection from '../api/dom/Selection';
import Editor from '../api/Editor';
import { FormatVars } from '../api/fmt/Format';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import { IdBookmark, IndexBookmark } from '../bookmark/BookmarkTypes';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import { RangeLikeObject } from '../selection/RangeTypes';
import * as RangeWalk from '../selection/RangeWalk';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as CaretFormat from './CaretFormat';
import * as ExpandRange from './ExpandRange';
import { isCaretNode } from './FormatContainer';
import * as FormatUtils from './FormatUtils';
import * as Hooks from './Hooks';
import * as MatchFormat from './MatchFormat';
import * as MergeFormats from './MergeFormats';

const each = Tools.each;

const isElementNode = function (node: Node) {
  return node && node.nodeType === 1 && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);
};

const applyFormat = function (ed: Editor, name: string, vars?: FormatVars, node?: Node | RangeLikeObject) {
  const formatList = ed.formatter.get(name);
  const format = formatList[0];
  let rng;
  const isCollapsed = !node && ed.selection.isCollapsed();
  const dom = ed.dom, selection: Selection = ed.selection;

  const setElementFormat = function (elm: Node, fmt?) {
    fmt = fmt || format;

    if (elm) {
      if (fmt.onformat) {
        fmt.onformat(elm, fmt, vars, node);
      }

      each(fmt.styles, function (value, name) {
        dom.setStyle(elm, name, FormatUtils.replaceVars(value, vars));
      });

      // Needed for the WebKit span spam bug
      // TODO: Remove this once WebKit/Blink fixes this
      if (fmt.styles) {
        const styleVal = dom.getAttrib(elm, 'style');

        if (styleVal) {
          dom.setAttrib(elm, 'data-mce-style', styleVal);
        }
      }

      each(fmt.attributes, function (value, name) {
        dom.setAttrib(elm, name, FormatUtils.replaceVars(value, vars));
      });

      each(fmt.classes, function (value) {
        value = FormatUtils.replaceVars(value, vars);

        if (!dom.hasClass(elm, value)) {
          dom.addClass(elm, value);
        }
      });
    }
  };

  const applyNodeStyle = function (formatList, node: Node) {
    let found = false;

    if (!format.selector) {
      return false;
    }

    // Look for matching formats
    each(formatList, function (format) {
      // Check collapsed state if it exists
      if ('collapsed' in format && format.collapsed !== isCollapsed) {
        return;
      }

      if (dom.is(node, format.selector) && !isCaretNode(node)) {
        setElementFormat(node, format);
        found = true;
        return false;
      }
    });

    return found;
  };

  const applyRngStyle = function (dom: DOMUtils, rng: RangeLikeObject, bookmark: IdBookmark | IndexBookmark, nodeSpecific?: boolean) {
    const newWrappers: Node[] = [];
    let contentEditable = true;

    // Setup wrapper element
    const wrapName = format.inline || format.block;
    const wrapElm = dom.create(wrapName);
    setElementFormat(wrapElm);

    RangeWalk.walk(dom, rng, function (nodes) {
      let currentWrapElm;

      /**
       * Process a list of nodes wrap them.
       */
      const process = function (node: Node) {
        let hasContentEditableState = false;
        let lastContentEditable = contentEditable;
        const nodeName = node.nodeName.toLowerCase();
        const parentName = node.parentNode.nodeName.toLowerCase();

        // Node has a contentEditable value
        if (NodeType.isElement(node) && dom.getContentEditable(node)) {
          lastContentEditable = contentEditable;
          contentEditable = dom.getContentEditable(node) === 'true';
          hasContentEditableState = true; // We don't want to wrap the container only it's children
        }

        // Stop wrapping on br elements
        if (FormatUtils.isEq(nodeName, 'br')) {
          currentWrapElm = 0;

          // Remove any br elements when we wrap things
          if (format.block) {
            dom.remove(node);
          }

          return;
        }

        // If node is wrapper type
        if (format.wrapper && MatchFormat.matchNode(ed, node, name, vars)) {
          currentWrapElm = 0;
          return;
        }

        // Can we rename the block
        // TODO: Break this if up, too complex
        if (contentEditable && !hasContentEditableState && format.block &&
          !format.wrapper && FormatUtils.isTextBlock(ed, nodeName) && FormatUtils.isValid(ed, parentName, wrapName)) {
          node = dom.rename(node, wrapName);
          setElementFormat(node);
          newWrappers.push(node);
          currentWrapElm = 0;
          return;
        }

        // Handle selector patterns
        if (format.selector) {
          const found = applyNodeStyle(formatList, node);

          // Continue processing if a selector match wasn't found and a inline element is defined
          if (!format.inline || found) {
            currentWrapElm = 0;
            return;
          }
        }

        // Is it valid to wrap this item
        // TODO: Break this if up, too complex
        if (contentEditable && !hasContentEditableState && FormatUtils.isValid(ed, wrapName, nodeName) && FormatUtils.isValid(ed, parentName, wrapName) &&
          !(!nodeSpecific && node.nodeType === 3 &&
            node.nodeValue.length === 1 &&
            node.nodeValue.charCodeAt(0) === 65279) &&
          !isCaretNode(node) &&
          (!format.inline || !dom.isBlock(node))) {
          // Start wrapping
          if (!currentWrapElm) {
            // Wrap the node
            currentWrapElm = dom.clone(wrapElm, false);
            node.parentNode.insertBefore(currentWrapElm, node);
            newWrappers.push(currentWrapElm);
          }

          currentWrapElm.appendChild(node);
        } else {
          // Start a new wrapper for possible children
          currentWrapElm = 0;

          each(Tools.grep(node.childNodes), process);

          if (hasContentEditableState) {
            contentEditable = lastContentEditable; // Restore last contentEditable state from stack
          }

          // End the last wrapper
          currentWrapElm = 0;
        }
      };

      // Process siblings from range
      each(nodes, process);
    });

    // Apply formats to links as well to get the color of the underline to change as well
    if (format.links === true) {
      each(newWrappers, function (node) {
        const process = function (node) {
          if (node.nodeName === 'A') {
            setElementFormat(node, format);
          }

          each(Tools.grep(node.childNodes), process);
        };

        process(node);
      });
    }

    // Cleanup
    each(newWrappers, function (node) {
      const getChildCount = function (node: Node) {
        let count = 0;

        each(node.childNodes, function (node) {
          if (!FormatUtils.isEmptyTextNode(node) && !Bookmarks.isBookmarkNode(node)) {
            count++;
          }
        });

        return count;
      };

      const getChildElementNode = function (root: Node): Node | false {
        let child: Node | false = false;
        each(root.childNodes, function (node) {
          if (isElementNode(node)) {
            child = node;
            return false; // break loop
          }
        });
        return child;
      };

      const mergeStyles = function (node: Node) {
        let clone;

        const child = getChildElementNode(node);

        // If child was found and of the same type as the current node
        if (child && !Bookmarks.isBookmarkNode(child) && MatchFormat.matchName(dom, child, format)) {
          clone = dom.clone(child, false);
          setElementFormat(clone);

          dom.replace(clone, node, true);
          dom.remove(child, true);
        }

        return clone || node;
      };

      const childCount = getChildCount(node);

      // Remove empty nodes but only if there is multiple wrappers and they are not block
      // elements so never remove single <h1></h1> since that would remove the
      // current empty block element where the caret is at
      if ((newWrappers.length > 1 || !dom.isBlock(node)) && childCount === 0) {
        dom.remove(node, true);
        return;
      }

      if (format.inline || format.wrapper) {
        // Merges the current node with it's children of similar type to reduce the number of elements
        if (!format.exact && childCount === 1) {
          node = mergeStyles(node);
        }

        MergeFormats.mergeWithChildren(ed, formatList, vars, node);
        MergeFormats.mergeWithParents(ed, format, name, vars, node);
        MergeFormats.mergeBackgroundColorAndFontSize(dom, format, vars, node);
        MergeFormats.mergeTextDecorationsAndColor(dom, format, vars, node);
        MergeFormats.mergeSubSup(dom, format, vars, node);
        MergeFormats.mergeSiblings(dom, format, vars, node);
      }
    });
  };

  if (dom.getContentEditable(selection.getNode()) === 'false') {
    node = selection.getNode();
    for (let i = 0, l = formatList.length; i < l; i++) {
      if (formatList[i].ceFalseOverride && dom.is(node, formatList[i].selector)) {
        setElementFormat(node, formatList[i]);
        return;
      }
    }

    return;
  }

  if (format) {
    if (node) {
      if (FormatUtils.isNode(node)) {
        if (!applyNodeStyle(formatList, node)) {
          rng = dom.createRng();
          rng.setStartBefore(node);
          rng.setEndAfter(node);
          applyRngStyle(dom, ExpandRange.expandRng(ed, rng, formatList), null, true);
        }
      } else {
        applyRngStyle(dom, node, null, true);
      }
    } else {
      if (!isCollapsed || !format.inline || TableCellSelection.getCellsFromEditor(ed).length) {
        // Obtain selection node before selection is unselected by applyRngStyle
        const curSelNode = selection.getNode();

        // If the formats have a default block and we can't find a parent block then
        // start wrapping it with a DIV this is for forced_root_blocks: false
        // It's kind of a hack but people should be using the default block type P since all desktop editors work that way
        if (!ed.settings.forced_root_block && formatList[0].defaultBlock && !dom.getParent(curSelNode, dom.isBlock)) {
          applyFormat(ed, formatList[0].defaultBlock);
        }

        // Apply formatting to selection
        selection.setRng(RangeNormalizer.normalize(selection.getRng()));
        SelectionUtils.preserve(selection, true, (bookmark) => {
          SelectionUtils.runOnRanges(ed, (selectionRng, fake) => {
            const expandedRng = fake ? selectionRng : ExpandRange.expandRng(ed, selectionRng, formatList);
            applyRngStyle(dom, expandedRng, bookmark);
          });
        });

        FormatUtils.moveStart(dom, selection, selection.getRng());
        ed.nodeChanged();
      } else {
        CaretFormat.applyCaretFormat(ed, name, vars);
      }
    }

    Hooks.postProcess(name, ed);
  }
};

export {
  applyFormat
};
