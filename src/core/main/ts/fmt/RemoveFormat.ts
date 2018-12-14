/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Bookmarks from '../bookmark/Bookmarks';
import NodeType from '../dom/NodeType';
import TreeWalker from '../api/dom/TreeWalker';
import * as CaretFormat from './CaretFormat';
import ExpandRange from './ExpandRange';
import FormatUtils from './FormatUtils';
import MatchFormat from './MatchFormat';
import RangeWalk from '../selection/RangeWalk';
import Tools from '../api/util/Tools';
import { Selection } from '../api/dom/Selection';
import GetBookmark from 'tinymce/core/bookmark/GetBookmark';
import { Editor } from 'tinymce/core/api/Editor';
import SplitRange from 'tinymce/core/selection/SplitRange';
import { Node } from '@ephox/dom-globals';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';
import { Element, Traverse, InsertAll, Insert } from '@ephox/sugar';
import { Option } from '@ephox/katamari';

const MCE_ATTR_RE = /^(src|href|style)$/;
const each = Tools.each;
const isEq = FormatUtils.isEq;

const isTableCell = function (node) {
  return /^(TH|TD)$/.test(node.nodeName);
};

const isChildOfInlineParent = (dom: DOMUtils, node: Node, parent: Node): boolean => {
  return dom.isChildOf(node, parent) && node !== parent && !dom.isBlock(parent);
};

const getContainer = function (ed, rng, start?) {
  let container, offset, lastIdx;

  container = rng[start ? 'startContainer' : 'endContainer'];
  offset = rng[start ? 'startOffset' : 'endOffset'];

  if (NodeType.isElement(container)) {
    lastIdx = container.childNodes.length - 1;

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

const wrap = function (dom, node, name, attrs?) {
  const wrapper = dom.create(name, attrs);

  node.parentNode.insertBefore(wrapper, node);
  wrapper.appendChild(node);

  return wrapper;
};

const wrapWithSiblings = (dom: DOMUtils, node: Node, next: boolean, name: string, attrs?): Node => {
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
const matchName = function (dom, node, format) {
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

const isColorFormatAndAnchor = function (node, format) {
  return format.links && node.tagName === 'A';
};

const find = function (dom, node, next, inc?) {
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
const removeNode = function (ed, node, format) {
  const parentNode = node.parentNode;
  let rootBlockElm;
  const dom = ed.dom, forcedRootBlock = ed.settings.forced_root_block;

  if (format.block) {
    if (!forcedRootBlock) {
      // Append BR elements if needed before we remove the block
      if (dom.isBlock(node) && !dom.isBlock(parentNode)) {
        if (!find(dom, node, false) && !find(dom, node.firstChild, true, 1)) {
          node.insertBefore(dom.create('br'), node.firstChild);
        }

        if (!find(dom, node, true) && !find(dom, node.lastChild, false, 1)) {
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

  dom.remove(node, 1);
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
const removeFormat = function (ed, format, vars?, node?, compareNode?) {
  let i, attrs, stylesModified;
  const dom = ed.dom;

  // Check if node matches format
  if (!matchName(dom, node, format) && !isColorFormatAndAnchor(node, format)) {
    return false;
  }

  // Should we compare with format attribs and styles
  if (format.remove !== 'all') {
    // Remove styles
    each(format.styles, function (value, name) {
      value = FormatUtils.normalizeStyleValue(dom, FormatUtils.replaceVars(value, vars), name);

      // Indexed array
      if (typeof name === 'number') {
        name = value;
        compareNode = 0;
      }

      if (format.remove_similar || (!compareNode || isEq(FormatUtils.getStyle(dom, compareNode, name), value))) {
        dom.setStyle(node, name, '');
      }

      stylesModified = 1;
    });

    // Remove style attribute if it's empty
    if (stylesModified && dom.getAttrib(node, 'style') === '') {
      node.removeAttribute('style');
      node.removeAttribute('data-mce-style');
    }

    // Remove attributes
    each(format.attributes, function (value, name) {
      let valueOut;

      value = FormatUtils.replaceVars(value, vars);

      // Indexed array
      if (typeof name === 'number') {
        name = value;
        compareNode = 0;
      }

      if (!compareNode || isEq(dom.getAttrib(compareNode, name), value)) {
        // Keep internal classes
        if (name === 'class') {
          value = dom.getAttrib(node, name);
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
              dom.setAttrib(node, name, valueOut);
              return;
            }
          }
        }

        // IE6 has a bug where the attribute doesn't get removed correctly
        if (name === 'class') {
          node.removeAttribute('className');
        }

        // Remove mce prefixed attributes
        if (MCE_ATTR_RE.test(name)) {
          node.removeAttribute('data-mce-' + name);
        }

        node.removeAttribute(name);
      }
    });

    // Remove classes
    each(format.classes, function (value) {
      value = FormatUtils.replaceVars(value, vars);

      if (!compareNode || dom.hasClass(compareNode, value)) {
        dom.removeClass(node, value);
      }
    });

    // Check for non internal attributes
    attrs = dom.getAttribs(node);
    for (i = 0; i < attrs.length; i++) {
      const attrName = attrs[i].nodeName;
      if (attrName.indexOf('_') !== 0 && attrName.indexOf('data-') !== 0) {
        return false;
      }
    }
  }

  // Remove the inline child if it's empty for example <b> or <span>
  if (format.remove !== 'none') {
    removeNode(ed, node, format);
    return true;
  }
};

const findFormatRoot = function (editor, container, name, vars, similar) {
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

const wrapAndSplit = function (editor, formatList, formatRoot, container, target, split, format, vars) {
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

const remove = function (ed: Editor, name: string, vars?, node?, similar?) {
  const formatList = ed.formatter.get(name), format = formatList[0];
  let bookmark, rng, contentEditable = true;
  const dom = ed.dom;
  const selection: Selection = ed.selection;

  const splitToFormatRoot = function (container) {
    const formatRoot = findFormatRoot(ed, container, name, vars, similar);
    return wrapAndSplit(ed, formatList, formatRoot, container, container, true, format, vars);
  };

  const isRemoveBookmarkNode = function (node: Node) {
    // Make sure to only check for bookmarks created here (eg _start or _end)
    // as there maybe nested bookmarks
    return Bookmarks.isBookmarkNode(node) && NodeType.isElement(node) && (node.id === '_start' || node.id === '_end');
  };

  // Merges the styles for each node
  const process = function (node) {
    let children, i, l, lastContentEditable, hasContentEditableState;

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

  const unwrap = function (start?) {
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

  const removeRngStyle = function (rng) {
    let startContainer, endContainer;
    const commonAncestorContainer = rng.commonAncestorContainer;

    rng = ExpandRange.expandRng(ed, rng, formatList, true);

    if (format.split) {
      // Split text nodes
      rng = SplitRange.split(rng);

      startContainer = getContainer(ed, rng, true);
      endContainer = getContainer(ed, rng);

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

        // Split start/end
        splitToFormatRoot(startContainer);
        splitToFormatRoot(endContainer);

        // Unwrap start/end to get real elements again
        startContainer = unwrap(true);
        endContainer = unwrap();
      } else {
        startContainer = endContainer = splitToFormatRoot(startContainer);
      }

      // Update range positions since they might have changed after the split operations
      rng.startContainer = startContainer.parentNode ? startContainer.parentNode : startContainer;
      rng.startOffset = dom.nodeIndex(startContainer);
      rng.endContainer = endContainer.parentNode ? endContainer.parentNode : endContainer;
      rng.endOffset = dom.nodeIndex(endContainer) + 1;
    }

    // Remove items between start/end
    RangeWalk.walk(dom, rng, function (nodes) {
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
    if (node.nodeType) {
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

export default {
  removeFormat,
  remove
};