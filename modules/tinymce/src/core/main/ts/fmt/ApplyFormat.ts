/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';
import { PredicateExists, SugarElement } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import { IdBookmark, IndexBookmark } from '../bookmark/BookmarkTypes';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import { RangeLikeObject } from '../selection/RangeTypes';
import * as RangeWalk from '../selection/RangeWalk';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as Settings from '../api/Settings';
import * as Empty from '../dom/Empty';
import * as CaretFormat from './CaretFormat';
import * as ExpandRange from './ExpandRange';
import { isCaretNode } from './FormatContainer';
import { ApplyFormat, BlockFormat, FormatVars, InlineFormat, SelectorFormat } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as Hooks from './Hooks';
import * as MatchFormat from './MatchFormat';
import * as MergeFormats from './MergeFormats';

const each = Tools.each;

type ApplyFormatProp = keyof InlineFormat | keyof BlockFormat | keyof SelectorFormat;

const hasFormatProperty = (format: ApplyFormat, prop: ApplyFormatProp): boolean =>
  Obj.hasNonNullableKey(format as any, prop);

const isElementNode = function (node: Node) {
  return node && node.nodeType === 1 && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);
};

const canFormatBR = (editor: Editor, format: ApplyFormat, node: HTMLBRElement, parentName: string) => {
  // TINY-6483: Can format 'br' if it is contained in a valid empty block and an inline format is being applied
  if (Settings.canFormatEmptyLines(editor) && FormatUtils.isInlineFormat(format)) {
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
    const hasCaretNodeSibling = PredicateExists.sibling(SugarElement.fromDom(node), (sibling) => isCaretNode(sibling.dom));
    return Obj.hasNonNullableKey(validBRParentElements, parentName) && Empty.isEmpty(SugarElement.fromDom(node.parentNode), false) && !hasCaretNodeSibling;
  } else {
    return false;
  }
};

const applyFormat = function (ed: Editor, name: string, vars?: FormatVars, node?: Node | RangeLikeObject) {
  const formatList = ed.formatter.get(name) as ApplyFormat[];
  const format = formatList[0];
  const isCollapsed = !node && ed.selection.isCollapsed();
  const dom = ed.dom;
  const selection = ed.selection;

  // TODO: Add actual type for fmt below
  const setElementFormat = function (elm: Node, fmt?: ApplyFormat) {
    fmt = fmt || format;

    if (elm) {
      if (fmt.onformat) {
        fmt.onformat(elm, fmt as any, vars, node);
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

    if (!FormatUtils.isSelectorFormat(format)) {
      return false;
    }

    // Look for matching formats
    each(formatList, function (format: any) {
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
    const newWrappers: Element[] = [];
    let contentEditable = true;

    // Setup wrapper element
    const wrapName = (format as InlineFormat).inline || (format as BlockFormat).block;
    const wrapElm = dom.create(wrapName);
    setElementFormat(wrapElm);

    RangeWalk.walk(dom, rng, function (nodes) {
      let currentWrapElm: Element | null;

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

        // Stop wrapping on br elements except when valid
        if (NodeType.isBr(node) && !canFormatBR(ed, format, node, parentName)) {
          currentWrapElm = null;
          // Remove any br elements when we wrap things
          if (FormatUtils.isBlockFormat(format)) {
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
        if (contentEditable && !hasContentEditableState && FormatUtils.isBlockFormat(format) &&
          !format.wrapper && FormatUtils.isTextBlock(ed, nodeName) && FormatUtils.isValid(ed, parentName, wrapName)) {
          const elm = dom.rename(node as Element, wrapName);
          setElementFormat(elm);
          newWrappers.push(elm);
          currentWrapElm = null;
          return;
        }

        // Handle selector patterns
        if (FormatUtils.isSelectorFormat(format)) {
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
          (!hasFormatProperty(format, 'inline') || !dom.isBlock(node))) {
          // Start wrapping
          if (!currentWrapElm) {
            // Wrap the node
            currentWrapElm = dom.clone(wrapElm, false) as Element;
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
        const process = function (node: Element) {
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

      const mergeStyles = function (node: Element) {
        let clone;

        const child = getChildElementNode(node);

        // If child was found and of the same type as the current node
        if (child && !Bookmarks.isBookmarkNode(child) && MatchFormat.matchName(dom, child, format)) {
          clone = dom.clone(child, false);
          setElementFormat(clone);

          // "matchName" will made sure we're dealing with an element, so cast as one
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

      if (FormatUtils.isInlineFormat(format) || format.wrapper) {
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
      const formatItem = formatList[i];
      if (formatItem.ceFalseOverride && FormatUtils.isSelectorFormat(formatItem) && dom.is(node, formatItem.selector)) {
        setElementFormat(node, formatItem);
        return;
      }
    }

    return;
  }

  if (format) {
    if (node) {
      if (FormatUtils.isNode(node)) {
        if (!applyNodeStyle(formatList, node)) {
          const rng = dom.createRng();
          rng.setStartBefore(node);
          rng.setEndAfter(node);
          applyRngStyle(dom, ExpandRange.expandRng(ed, rng, formatList), null, true);
        }
      } else {
        applyRngStyle(dom, node, null, true);
      }
    } else {
      if (!isCollapsed || !FormatUtils.isInlineFormat(format) || TableCellSelection.getCellsFromEditor(ed).length) {
        // Obtain selection node before selection is unselected by applyRngStyle
        const curSelNode = selection.getNode();

        // If the formats have a default block and we can't find a parent block then
        // start wrapping it with a DIV this is for forced_root_blocks: false
        // It's kind of a hack but people should be using the default block type P since all desktop editors work that way
        const firstFormat = (formatList[0] as ApplyFormat & { defaultBlock?: string }); // TODO: Should this just check if it's a SelectorFormat
        if (!ed.settings.forced_root_block && firstFormat.defaultBlock && !dom.getParent(curSelNode, dom.isBlock)) {
          applyFormat(ed, firstFormat.defaultBlock);
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
