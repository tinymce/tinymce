/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, HTMLBRElement, Element } from '@ephox/dom-globals';
import { Obj } from '@ephox/katamari';
import { PredicateExists } from '@ephox/sugar';
import Bookmarks from '../bookmark/Bookmarks';
import NodeType from '../dom/NodeType';
import Settings from '../api/Settings';
import Empty from '../dom/Empty';
import * as CaretFormat from './CaretFormat';
import ExpandRange from './ExpandRange';
import FormatUtils from './FormatUtils';
import Hooks from './Hooks';
import MatchFormat from './MatchFormat';
import MergeFormats from './MergeFormats';
import RangeNormalizer from '../selection/RangeNormalizer';
import RangeWalk from '../selection/RangeWalk';
import Tools from '../api/util/Tools';
import Selection from '../api/dom/Selection';
import { isCaretNode } from './FormatContainer';
import GetBookmark from '../bookmark/GetBookmark';
import Editor from '../api/Editor';
import { ApplyFormat, BlockFormat, FormatVars, InlineFormat, SelectorFormat } from '../api/fmt/Format';

const each = Tools.each;

const hasNonNullableKey = (obj, key) =>
  Obj.has(obj, key) && obj[key] !== undefined && obj[key] !== null;

// TODO: is this correct? As a "mixed" format has both `selector` and `inline` properties
const isInlineFormat = (format: ApplyFormat): format is InlineFormat =>
  hasNonNullableKey(format as any, 'inline');

const fromDom = (node) => {
  // TODO: Consider removing this check, but left atm for safety
  if (node === null || node === undefined) { throw new Error('Node cannot be null or undefined'); }
  return {
    dom: () => node,
  };
};

type ApplyFormatProp = keyof InlineFormat | keyof BlockFormat | keyof SelectorFormat;

const hasFormatProperty = (format: ApplyFormat, prop: ApplyFormatProp): boolean =>
  hasNonNullableKey(format as any, prop);

const isElementNode = function (node: Node) {
  return node && node.nodeType === 1 && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);
};

const canFormatBR = (editor: Editor, format: ApplyFormat, node: HTMLBRElement, parentName: string) => {
  // TINY-6483: Can format 'br' if it is contained in a valid empty block and an inline format is being applied
  if (Settings.canFormatEmptyLines(editor) && isInlineFormat(format)) {
    // A curated list using the textBlockElements map and parts of the blockElements map from the schema
    const validBRParentElements: Record<string, {}> = {
      ...editor.schema.getTextBlockElements(),
      td: {},
      th: {},
      li: {},
      dt: {},
      dd: {},
      figcaption: {},
      caption: {},
      details: {},
      summary: {}
    };
    // If a caret node is present, the format should apply to that, not the br (applicable to collapsed selections)
    const hasCaretNodeSibling = PredicateExists.sibling(fromDom(node), (sibling) => isCaretNode(sibling.dom()));
    return hasNonNullableKey(validBRParentElements, parentName) && Empty.isEmpty(fromDom(node.parentNode), false) && !hasCaretNodeSibling;
  } else {
    return false;
  }
};

const applyFormat = function (ed: Editor, name: string, vars?, node?) {
  const formatList = ed.formatter.get(name);
  const format = formatList[0];
  let bookmark, rng;
  const isCollapsed = !node && ed.selection.isCollapsed();
  const dom = ed.dom, selection: Selection = ed.selection;

  const setElementFormat = function (elm, fmt?) {
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
          elm.setAttribute('data-mce-style', styleVal);
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

  const applyNodeStyle = function (formatList, node) {
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

  const applyRngStyle = function (dom, rng, bookmark, nodeSpecific?) {
    const newWrappers = [];
    let wrapName, wrapElm, contentEditable = true;

    // Setup wrapper element
    wrapName = format.inline || format.block;
    wrapElm = dom.create(wrapName);
    setElementFormat(wrapElm);

    RangeWalk.walk(dom, rng, function (nodes) {
      let currentWrapElm;

      /**
       * Process a list of nodes wrap them.
       */
      const process = function (node) {
        let nodeName, parentName, hasContentEditableState, lastContentEditable;

        lastContentEditable = contentEditable;
        nodeName = node.nodeName.toLowerCase();
        parentName = node.parentNode.nodeName.toLowerCase();

        // Node has a contentEditable value
        if (node.nodeType === 1 && dom.getContentEditable(node)) {
          lastContentEditable = contentEditable;
          contentEditable = dom.getContentEditable(node) === 'true';
          hasContentEditableState = true; // We don't want to wrap the container only it's children
        }

        // Stop wrapping on br elements except when valid
        if (NodeType.isBr(node) && !canFormatBR(ed, format, node, parentName)) {
          currentWrapElm = null;
          // Remove any br elements when we wrap things
          if (format.block) {
            dom.remove(node);
          }
          return;
        }

        // If node is wrapper type
        if (format.wrapper && MatchFormat.matchNode(ed, node, name, vars)) {
          currentWrapElm = null;
          return;
        }

        // Can we rename the block
        // TODO: Break this if up, too complex
        if (contentEditable && !hasContentEditableState && format.block &&
          !format.wrapper && FormatUtils.isTextBlock(ed, nodeName) && FormatUtils.isValid(ed, parentName, wrapName)) {
          const elm = dom.rename(node as Element, wrapName);
          setElementFormat(elm);
          newWrappers.push(elm);
          currentWrapElm = null;
          return;
        }

        // Handle selector patterns
        if (format.selector) {
          const found = applyNodeStyle(formatList, node);

          // Continue processing if a selector match wasn't found and a inline element is defined
          if (!hasFormatProperty(format, 'inline') || found) {
            currentWrapElm = null;
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
          currentWrapElm = null;

          each(Tools.grep(node.childNodes), process);

          if (hasContentEditableState) {
            contentEditable = lastContentEditable; // Restore last contentEditable state from stack
          }

          // End the last wrapper
          currentWrapElm = null;
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
      let childCount;

      const getChildCount = function (node) {
        let count = 0;

        each(node.childNodes, function (node) {
          if (!FormatUtils.isWhiteSpaceNode(node) && !Bookmarks.isBookmarkNode(node)) {
            count++;
          }
        });

        return count;
      };

      const getChildElementNode = function (root) {
        let child = false;
        each(root.childNodes, function (node) {
          if (isElementNode(node)) {
            child = node;
            return false; // break loop
          }
        });
        return child;
      };

      const mergeStyles = function (node) {
        let child, clone;

        child = getChildElementNode(node);

        // If child was found and of the same type as the current node
        if (child && !Bookmarks.isBookmarkNode(child) && MatchFormat.matchName(dom, child, format)) {
          clone = dom.clone(child, false);
          setElementFormat(clone);

          dom.replace(clone, node, true);
          dom.remove(child, 1);
        }

        return clone || node;
      };

      childCount = getChildCount(node);

      // Remove empty nodes but only if there is multiple wrappers and they are not block
      // elements so never remove single <h1></h1> since that would remove the
      // current empty block element where the caret is at
      if ((newWrappers.length > 1 || !dom.isBlock(node)) && childCount === 0) {
        dom.remove(node, 1);
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
        MergeFormats.mergeSubSup(dom, format, vars, node);
        MergeFormats.mergeSiblings(dom, format, vars, node);
      }
    });
  };

  if (dom.getContentEditable(selection.getNode()) === 'false') {
    node = selection.getNode();
    for (let i = 0, l = formatList.length as number; i < l; i++) {
      if (formatList[i].ceFalseOverride && dom.is(node, formatList[i].selector)) {
        setElementFormat(node, formatList[i]);
        return;
      }
    }

    return;
  }

  if (format) {
    if (node) {
      if (node.nodeType) {
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
      if (!isCollapsed || !format.inline || dom.select('td[data-mce-selected],th[data-mce-selected]').length) {
        // Obtain selection node before selection is unselected by applyRngStyle
        const curSelNode = ed.selection.getNode();

        // If the formats have a default block and we can't find a parent block then
        // start wrapping it with a DIV this is for forced_root_blocks: false
        // It's kind of a hack but people should be using the default block type P since all desktop editors work that way
        if (!ed.settings.forced_root_block && formatList[0].defaultBlock && !dom.getParent(curSelNode, dom.isBlock)) {
          applyFormat(ed, formatList[0].defaultBlock);
        }

        // Apply formatting to selection
        ed.selection.setRng(RangeNormalizer.normalize(ed.selection.getRng()));
        bookmark = GetBookmark.getPersistentBookmark(ed.selection, true);
        applyRngStyle(dom, ExpandRange.expandRng(ed, selection.getRng(), formatList), bookmark);

        if (format.styles) {
          MergeFormats.mergeUnderlineAndColor(dom, format, vars, curSelNode);
        }

        selection.moveToBookmark(bookmark);
        FormatUtils.moveStart(dom, selection, selection.getRng());
        ed.nodeChanged();
      } else {
        CaretFormat.applyCaretFormat(ed, name, vars);
      }
    }

    Hooks.postProcess(name, ed);
  }
};

export default {
  applyFormat
};