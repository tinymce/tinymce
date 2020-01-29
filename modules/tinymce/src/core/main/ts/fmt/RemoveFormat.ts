/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DomElement, Node, Range } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Element, Insert, InsertAll, Traverse } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import Selection from '../api/dom/Selection';
import TreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import { FormatAttrOrStyleValue, FormatVars, RemoveFormat } from '../api/fmt/Format';
import Settings from '../api/Settings';
import Tools from '../api/util/Tools';
import Bookmarks from '../bookmark/Bookmarks';
import GetBookmark from '../bookmark/GetBookmark';
import NodeType from '../dom/NodeType';
import { RangeLikeObject } from '../selection/RangeTypes';
import RangeWalk from '../selection/RangeWalk';
import * as SplitRange from '../selection/SplitRange';
import * as CaretFormat from './CaretFormat';
import * as ExpandRange from './ExpandRange';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

const MCE_ATTR_RE = /^(src|href|style)$/;
const each = Tools.each;
const isEq = FormatUtils.isEq;

const isTableCell = function (node) {
  return /^(TH|TD)$/.test(node.nodeName);
};

const isChildOfInlineParent = (dom: DOMUtils, node: Node, parent: Node): boolean => {
  return dom.isChildOf(node, parent) && node !== parent && !dom.isBlock(parent);
};

const getContainer = function (ed: Editor, rng: RangeLikeObject, start?: boolean) {
  let container: Node, offset: number;

  container = rng[start ? 'startContainer' : 'endContainer'];
  offset = rng[start ? 'startOffset' : 'endOffset'];

  if (NodeType.isElement(container)) {
    const lastIdx = container.childNodes.length - 1;

    if (!start && offset) {
      offset--;
    }

    container = container.childNodes[offset > lastIdx ? lastIdx : offset];
  }

  // If start text node is excluded then walk to the next node
  if (NodeType.isText(container) && start && offset >= container.nodeValue.length) {
    container = new TreeWalker(container, ed.getBody()).next() || container;
  }

  // If end text node is excluded then walk to the previous node
  if (NodeType.isText(container) && !start && offset === 0) {
    container = new TreeWalker(container, ed.getBody()).prev() || container;
  }

  return container;
};

const wrap = function (dom: DOMUtils, node: Node, name: string, attrs?: Record<string, string>) {
  const wrapper = dom.create(name, attrs);

  node.parentNode.insertBefore(wrapper, node);
  wrapper.appendChild(node);

  return wrapper;
};

const wrapWithSiblings = (dom: DOMUtils, node: Node, next: boolean, name: string, attrs?: Record<string, string>): Node => {
  const start = Element.fromDom(node);
  const wrapper = Element.fromDom(dom.create(name, attrs));
  const siblings = next ? Traverse.nextSiblings(start) : Traverse.prevSiblings(start);

  InsertAll.append(wrapper, siblings);
  if (next) {
    Insert.before(start, wrapper);
    Insert.prepend(wrapper, start);
  } else {
    Insert.after(start, wrapper);
    Insert.append(wrapper, start);
  }

  return wrapper.dom();
};

/**
 * Checks if the specified nodes name matches the format inline/block or selector.
 *
 * @private
 * @param {Node} node Node to match against the specified format.
 * @param {Object} format Format object o match with.
 * @return {boolean} true/false if the format matches.
 */
const matchName = function (dom: DOMUtils, node: Node, format) {
  // Check for inline match
  if (isEq(node, format.inline)) {
    return true;
  }

  // Check for block match
  if (isEq(node, format.block)) {
    return true;
  }

  // Check for selector match
  if (format.selector) {
    return NodeType.isElement(node) && dom.is(node, format.selector);
  }
};

const isColorFormatAndAnchor = function (node: Node, format) {
  return format.links && node.nodeName === 'A';
};

const find = function (dom: DOMUtils, node: Node, next: boolean, inc?: boolean) {
  node = FormatUtils.getNonWhiteSpaceSibling(node, next, inc);
  return !node || (node.nodeName === 'BR' || dom.isBlock(node));
};

/**
 * Removes the node and wrap it's children in paragraphs before doing so or
 * appends BR elements to the beginning/end of the block element if forcedRootBlocks is disabled.
 *
 * If the div in the node below gets removed:
 *  text<div>text</div>text
 *
 * Output becomes:
 *  text<div><br />text<br /></div>text
 *
 * So when the div is removed the result is:
 *  text<br />text<br />text
 *
 * @private
 * @param {Node} node Node to remove + apply BR/P elements to.
 * @param {Object} format Format rule.
 * @return {Node} Input node.
 */
const removeNode = function (ed: Editor, node: Node, format) {
  const parentNode = node.parentNode;
  let rootBlockElm;
  const dom = ed.dom, forcedRootBlock = Settings.getForcedRootBlock(ed);

  if (format.block) {
    if (!forcedRootBlock) {
      // Append BR elements if needed before we remove the block
      if (dom.isBlock(node) && !dom.isBlock(parentNode)) {
        if (!find(dom, node, false) && !find(dom, node.firstChild, true, true)) {
          node.insertBefore(dom.create('br'), node.firstChild);
        }

        if (!find(dom, node, true) && !find(dom, node.lastChild, false, true)) {
          node.appendChild(dom.create('br'));
        }
      }
    } else {
      // Wrap the block in a forcedRootBlock if we are at the root of document
      if (parentNode === dom.getRoot()) {
        if (!format.list_block || !isEq(node, format.list_block)) {
          each(Tools.grep(node.childNodes), function (node) {
            if (FormatUtils.isValid(ed, forcedRootBlock, node.nodeName.toLowerCase())) {
              if (!rootBlockElm) {
                rootBlockElm = wrap(dom, node, forcedRootBlock);
                dom.setAttribs(rootBlockElm, ed.settings.forced_root_block_attrs);
              } else {
                rootBlockElm.appendChild(node);
              }
            } else {
              rootBlockElm = 0;
            }
          });
        }
      }
    }
  }

  // Never remove nodes that isn't the specified inline element if a selector is specified too
  if (format.selector && format.inline && !isEq(format.inline, node)) {
    return;
  }

  dom.remove(node, true);
};

/**
 * Removes the specified format for the specified node. It will also remove the node if it doesn't have
 * any attributes if the format specifies it to do so.
 *
 * @private
 * @param {Object} format Format object with items to remove from node.
 * @param {Object} vars Name/value object with variables to apply to format.
 * @param {Node} node Node to remove the format styles on.
 * @param {Node} compareNode Optional compare node, if specified the styles will be compared to that node.
 * @return {Boolean} True/false if the node was removed or not.
 */
const removeFormat = function (ed: Editor, format: RemoveFormat, vars?: FormatVars, node?: Node, compareNode?: Node) {
  let stylesModified: boolean;
  const dom = ed.dom;

  // Check if node matches format
  if (!matchName(dom, node, format) && !isColorFormatAndAnchor(node, format)) {
    return false;
  }

  // "matchName" will made sure we're dealing with an element, so cast as one
  const elm = node as DomElement;

  // Should we compare with format attribs and styles
  if (format.remove !== 'all') {
    // Remove styles
    each(format.styles, function (value: FormatAttrOrStyleValue, name: string) {
      value = FormatUtils.normalizeStyleValue(dom, FormatUtils.replaceVars(value, vars), name);

      // Indexed array
      if (typeof name === 'number') {
        name = value;
        compareNode = null;
      }

      if (format.remove_similar || (!compareNode || isEq(FormatUtils.getStyle(dom, compareNode, name), value))) {
        dom.setStyle(elm, name, '');
      }

      stylesModified = true;
    });

    // Remove style attribute if it's empty
    if (stylesModified && dom.getAttrib(elm, 'style') === '') {
      elm.removeAttribute('style');
      elm.removeAttribute('data-mce-style');
    }

    // Remove attributes
    each(format.attributes, function (value: FormatAttrOrStyleValue, name: string) {
      let valueOut;

      value = FormatUtils.replaceVars(value, vars);

      // Indexed array
      if (typeof name === 'number') {
        name = value;
        compareNode = null;
      }

      if (format.remove_similar || (!compareNode || isEq(dom.getAttrib(compareNode, name), value))) {
        // Keep internal classes
        if (name === 'class') {
          value = dom.getAttrib(elm, name);
          if (value) {
            // Build new class value where everything is removed except the internal prefixed classes
            valueOut = '';
            each(value.split(/\s+/), function (cls) {
              if (/mce\-\w+/.test(cls)) {
                valueOut += (valueOut ? ' ' : '') + cls;
              }
            });

            // We got some internal classes left
            if (valueOut) {
              dom.setAttrib(elm, name, valueOut);
              return;
            }
          }
        }

        // IE6 has a bug where the attribute doesn't get removed correctly
        if (name === 'class') {
          elm.removeAttribute('className');
        }

        // Remove mce prefixed attributes
        if (MCE_ATTR_RE.test(name)) {
          elm.removeAttribute('data-mce-' + name);
        }

        elm.removeAttribute(name);
      }
    });

    // Remove classes
    each(format.classes, function (value) {
      value = FormatUtils.replaceVars(value, vars);

      if (!compareNode || dom.hasClass(compareNode, value)) {
        dom.removeClass(elm, value);
      }
    });

    // Check for non internal attributes
    const attrs = dom.getAttribs(elm);
    for (let i = 0; i < attrs.length; i++) {
      const attrName = attrs[i].nodeName;
      if (attrName.indexOf('_') !== 0 && attrName.indexOf('data-') !== 0) {
        return false;
      }
    }
  }

  // Remove the inline child if it's empty for example <b> or <span>
  if (format.remove !== 'none') {
    removeNode(ed, elm, format);
    return true;
  }
};

const findFormatRoot = function (editor: Editor, container: Node, name: string, vars: FormatVars, similar: boolean) {
  let formatRoot;

  // Find format root
  each(FormatUtils.getParents(editor.dom, container.parentNode).reverse(), function (parent) {
    let format;

    // Find format root element
    if (!formatRoot && parent.id !== '_start' && parent.id !== '_end') {
      // Is the node matching the format we are looking for
      format = MatchFormat.matchNode(editor, parent, name, vars, similar);
      if (format && format.split !== false) {
        formatRoot = parent;
      }
    }
  });

  return formatRoot;
};

const wrapAndSplit = function (editor: Editor, formatList, formatRoot: Node, container: Node, target: Node, split: boolean, format, vars: FormatVars) {
  let parent, clone, lastClone, firstClone, i, formatRootParent;
  const dom = editor.dom;

  // Format root found then clone formats and split it
  if (formatRoot) {
    formatRootParent = formatRoot.parentNode;

    for (parent = container.parentNode; parent && parent !== formatRootParent; parent = parent.parentNode) {
      clone = dom.clone(parent, false);

      for (i = 0; i < formatList.length; i++) {
        if (removeFormat(editor, formatList[i], vars, clone, clone)) {
          clone = 0;
          break;
        }
      }

      // Build wrapper node
      if (clone) {
        if (lastClone) {
          clone.appendChild(lastClone);
        }

        if (!firstClone) {
          firstClone = clone;
        }

        lastClone = clone;
      }
    }

    // Never split block elements if the format is mixed
    if (split && (!format.mixed || !dom.isBlock(formatRoot))) {
      container = dom.split(formatRoot, container);
    }

    // Wrap container in cloned formats
    if (lastClone) {
      target.parentNode.insertBefore(lastClone, target);
      firstClone.appendChild(target);
    }
  }

  return container;
};

const remove = function (ed: Editor, name: string, vars?: FormatVars, node?: Node | Range, similar?) {
  const formatList = ed.formatter.get(name), format = formatList[0];
  let bookmark, rng, contentEditable = true;
  const dom = ed.dom;
  const selection: Selection = ed.selection;

  const splitToFormatRoot = function (container: Node) {
    const formatRoot = findFormatRoot(ed, container, name, vars, similar);
    return wrapAndSplit(ed, formatList, formatRoot, container, container, true, format, vars);
  };

  const isRemoveBookmarkNode = function (node: Node) {
    // Make sure to only check for bookmarks created here (eg _start or _end)
    // as there maybe nested bookmarks
    return Bookmarks.isBookmarkNode(node) && NodeType.isElement(node) && (node.id === '_start' || node.id === '_end');
  };

  // Merges the styles for each node
  const process = function (node: Node) {
    let children: Node[], i, l, lastContentEditable, hasContentEditableState;

    // Node has a contentEditable value
    if (NodeType.isElement(node) && dom.getContentEditable(node)) {
      lastContentEditable = contentEditable;
      contentEditable = dom.getContentEditable(node) === 'true';
      hasContentEditableState = true; // We don't want to wrap the container only it's children
    }

    // Grab the children first since the nodelist might be changed
    children = Tools.grep(node.childNodes);

    // Process current node
    if (contentEditable && !hasContentEditableState) {
      for (i = 0, l = formatList.length; i < l; i++) {
        if (removeFormat(ed, formatList[i], vars, node, node)) {
          break;
        }
      }
    }

    // Process the children
    if (format.deep) {
      if (children.length) {
        for (i = 0, l = children.length; i < l; i++) {
          process(children[i]);
        }

        if (hasContentEditableState) {
          contentEditable = lastContentEditable; // Restore last contentEditable state from stack
        }
      }
    }
  };

  const unwrap = function (start?: boolean) {
    const node = dom.get(start ? '_start' : '_end');
    let out = node[start ? 'firstChild' : 'lastChild'];

    // If the end is placed within the start the result will be removed
    // So this checks if the out node is a bookmark node if it is it
    // checks for another more suitable node
    if (isRemoveBookmarkNode(out)) {
      out = out[start ? 'firstChild' : 'lastChild'];
    }

    // Since dom.remove removes empty text nodes then we need to try to find a better node
    if (NodeType.isText(out) && out.data.length === 0) {
      out = start ? node.previousSibling || node.nextSibling : node.nextSibling || node.previousSibling;
    }

    dom.remove(node, true);

    return out;
  };

  const removeRngStyle = function (rng: Range) {
    let startContainer, endContainer;
    const commonAncestorContainer = rng.commonAncestorContainer;

    let expandedRng = ExpandRange.expandRng(ed, rng, formatList, true);

    if (format.split) {
      // Split text nodes
      expandedRng = SplitRange.split(expandedRng);

      startContainer = getContainer(ed, expandedRng, true);
      endContainer = getContainer(ed, expandedRng);

      if (startContainer !== endContainer) {
        // WebKit will render the table incorrectly if we wrap a TH or TD in a SPAN
        // so let's see if we can use the first child instead
        // This will happen if you triple click a table cell and use remove formatting
        if (/^(TR|TH|TD)$/.test(startContainer.nodeName) && startContainer.firstChild) {
          if (startContainer.nodeName === 'TR') {
            startContainer = startContainer.firstChild.firstChild || startContainer;
          } else {
            startContainer = startContainer.firstChild || startContainer;
          }
        }

        // Try to adjust endContainer as well if cells on the same row were selected - bug #6410
        if (commonAncestorContainer &&
          /^T(HEAD|BODY|FOOT|R)$/.test(commonAncestorContainer.nodeName) &&
          isTableCell(endContainer) && endContainer.firstChild) {
          endContainer = endContainer.firstChild || endContainer;
        }

        // Wrap and split if nested
        if (isChildOfInlineParent(dom, startContainer, endContainer)) {
          const marker = Option.from(startContainer.firstChild).getOr(startContainer);
          splitToFormatRoot(wrapWithSiblings(dom, marker, true, 'span', { 'id': '_start', 'data-mce-type': 'bookmark' }));
          unwrap(true);
          return;
        }

        // Wrap and split if nested
        if (isChildOfInlineParent(dom, endContainer, startContainer)) {
          const marker = Option.from(endContainer.lastChild).getOr(endContainer);
          splitToFormatRoot(wrapWithSiblings(dom, marker, false, 'span', { 'id': '_end', 'data-mce-type': 'bookmark' }));
          unwrap(false);
          return;
        }

        // Wrap start/end nodes in span element since these might be cloned/moved
        startContainer = wrap(dom, startContainer, 'span', { 'id': '_start', 'data-mce-type': 'bookmark' });
        endContainer = wrap(dom, endContainer, 'span', { 'id': '_end', 'data-mce-type': 'bookmark' });

        // Split start/end and anything in between
        const newRng = dom.createRng();
        newRng.setStartAfter(startContainer);
        newRng.setEndBefore(endContainer);
        RangeWalk.walk(dom, newRng, (nodes) => {
          Arr.each(nodes, (n) => {
            if (!Bookmarks.isBookmarkNode(n) && !Bookmarks.isBookmarkNode(n.parentNode)) {
              splitToFormatRoot(n);
            }
          });
        });
        splitToFormatRoot(startContainer);
        splitToFormatRoot(endContainer);

        // Unwrap start/end to get real elements again
        startContainer = unwrap(true);
        endContainer = unwrap();
      } else {
        startContainer = endContainer = splitToFormatRoot(startContainer);
      }

      // Update range positions since they might have changed after the split operations
      expandedRng.startContainer = startContainer.parentNode ? startContainer.parentNode : startContainer;
      expandedRng.startOffset = dom.nodeIndex(startContainer);
      expandedRng.endContainer = endContainer.parentNode ? endContainer.parentNode : endContainer;
      expandedRng.endOffset = dom.nodeIndex(endContainer) + 1;
    }

    // Remove items between start/end
    RangeWalk.walk(dom, expandedRng, function (nodes) {
      each(nodes, function (node) {
        process(node);

        // Remove parent span if it only contains text-decoration: underline, yet a parent node is also underlined.
        if (NodeType.isElement(node) && ed.dom.getStyle(node, 'text-decoration') === 'underline' &&
          node.parentNode && FormatUtils.getTextDecoration(dom, node.parentNode) === 'underline') {
          removeFormat(ed, {
            deep: false,
            exact: true,
            inline: 'span',
            styles: {
              textDecoration: 'underline'
            }
          }, null, node);
        }
      });
    });
  };

  // Handle node
  if (node) {
    if (FormatUtils.isNode(node)) {
      rng = dom.createRng();
      rng.setStartBefore(node);
      rng.setEndAfter(node);
      removeRngStyle(rng);
    } else {
      removeRngStyle(node);
    }

    return;
  }

  if (dom.getContentEditable(selection.getNode()) === 'false') {
    node = selection.getNode();
    for (let i = 0, l = formatList.length; i < l; i++) {
      if (formatList[i].ceFalseOverride) {
        if (removeFormat(ed, formatList[i], vars, node, node)) {
          break;
        }
      }
    }

    return;
  }

  if (!selection.isCollapsed() || !format.inline || dom.select('td[data-mce-selected],th[data-mce-selected]').length) {
    bookmark = GetBookmark.getPersistentBookmark(ed.selection, true);
    removeRngStyle(selection.getRng());
    selection.moveToBookmark(bookmark);

    // Check if start element still has formatting then we are at: "<b>text|</b>text"
    // and need to move the start into the next text node
    if (format.inline && MatchFormat.match(ed, name, vars, selection.getStart())) {
      FormatUtils.moveStart(dom, selection, selection.getRng());
    }

    ed.nodeChanged();
  } else {
    CaretFormat.removeCaretFormat(ed, name, vars, similar);
  }
};

export {
  removeFormat,
  remove
};
