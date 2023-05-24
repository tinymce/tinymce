import { Adt, Arr, Fun, Optional, Type } from '@ephox/katamari';
import { Insert, InsertAll, SugarElement, Traverse } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as Events from '../api/Events';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as TransparentElements from '../content/TransparentElements';
import ElementUtils from '../dom/ElementUtils';
import * as NodeType from '../dom/NodeType';
import { RangeLikeObject } from '../selection/RangeTypes';
import * as RangeWalk from '../selection/RangeWalk';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as SplitRange from '../selection/SplitRange';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as CaretFormat from './CaretFormat';
import * as ExpandRange from './ExpandRange';
import { Format, FormatAttrOrStyleValue, FormatVars } from './FormatTypes';
import { normalizeStyleValue } from './FormatUtils';
import * as FormatUtils from './FormatUtils';
import * as ListItemFormat from './ListItemFormat';
import * as MatchFormat from './MatchFormat';
import { mergeSiblings } from './MergeUtils';

interface RemoveFormatAdt {
  fold: <T> (
    keep: () => T,
    rename: (name: string) => T,
    removed: () => T
  ) => T;
  match: <T>(branches: {
    keep: () => T;
    rename: (name: string) => T;
    removed: () => T;
  }) => T;
  log: (label: string) => void;
}

const removeResult: {
  keep: () => RemoveFormatAdt;
  rename: (name: string) => RemoveFormatAdt;
  removed: () => RemoveFormatAdt;
} = Adt.generate([
  { keep: [] },
  { rename: [ 'name' ] },
  { removed: [] }
]);

const MCE_ATTR_RE = /^(src|href|style)$/;
const each = Tools.each;
const isEq = FormatUtils.isEq;

const isTableCellOrRow = (node: Node) => /^(TR|TH|TD)$/.test(node.nodeName);

const isChildOfInlineParent = (dom: DOMUtils, node: Node, parent: Node): boolean => dom.isChildOf(node, parent) && node !== parent && !dom.isBlock(parent);

const getContainer = (ed: Editor, rng: RangeLikeObject, start?: boolean) => {
  let container = rng[start ? 'startContainer' : 'endContainer'];
  let offset = rng[start ? 'startOffset' : 'endOffset'];

  if (NodeType.isElement(container)) {
    const lastIdx = container.childNodes.length - 1;

    if (!start && offset) {
      offset--;
    }

    container = container.childNodes[offset > lastIdx ? lastIdx : offset];
  }

  // If start text node is excluded then walk to the next node
  if (NodeType.isText(container) && start && offset >= container.data.length) {
    container = new DomTreeWalker(container, ed.getBody()).next() || container;
  }

  // If end text node is excluded then walk to the previous node
  if (NodeType.isText(container) && !start && offset === 0) {
    container = new DomTreeWalker(container, ed.getBody()).prev() || container;
  }

  return container;
};

const normalizeTableSelection = (node: Node, start: boolean): Node => {
  const prop = start ? 'firstChild' : 'lastChild';
  const childNode = node[prop];
  if (isTableCellOrRow(node) && childNode) {
    if (node.nodeName === 'TR') {
      return childNode[prop] || childNode;
    } else {
      return childNode;
    }
  }

  return node;
};

const wrap = (dom: DOMUtils, node: Node, name: string, attrs?: Record<string, string>) => {
  const wrapper = dom.create(name, attrs);

  node.parentNode?.insertBefore(wrapper, node);
  wrapper.appendChild(node);

  return wrapper;
};

const wrapWithSiblings = (dom: DOMUtils, node: Node, next: boolean, name: string, attrs?: Record<string, string>): Node => {
  const start = SugarElement.fromDom(node);
  const wrapper = SugarElement.fromDom(dom.create(name, attrs));
  const siblings = next ? Traverse.nextSiblings(start) : Traverse.prevSiblings(start);

  InsertAll.append(wrapper, siblings);
  if (next) {
    Insert.before(start, wrapper);
    Insert.prepend(wrapper, start);
  } else {
    Insert.after(start, wrapper);
    Insert.append(wrapper, start);
  }

  return wrapper.dom;
};

const isColorFormatAndAnchor = (node: Node, format: Format) => format.links && node.nodeName === 'A';

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
const removeNode = (ed: Editor, node: Node, format: Format): void => {
  const parentNode = node.parentNode;
  let rootBlockElm: Element | null;
  const dom = ed.dom;
  const forcedRootBlock = Options.getForcedRootBlock(ed);

  if (FormatUtils.isBlockFormat(format)) {
    // Wrap the block in a forcedRootBlock if we are at the root of document
    if (parentNode === dom.getRoot()) {
      if (!format.list_block || !isEq(node, format.list_block)) {
        Arr.each(Arr.from(node.childNodes), (node) => {
          if (FormatUtils.isValid(ed, forcedRootBlock, node.nodeName.toLowerCase())) {
            if (!rootBlockElm) {
              rootBlockElm = wrap(dom, node, forcedRootBlock);
              dom.setAttribs(rootBlockElm, Options.getForcedRootBlockAttrs(ed));
            } else {
              rootBlockElm.appendChild(node);
            }
          } else {
            rootBlockElm = null;
          }
        });
      }
    }
  }

  // Never remove nodes that aren't the specified inline element if a selector is specified too
  if (FormatUtils.isMixedFormat(format) && !isEq(format.inline, node)) {
    return;
  }

  dom.remove(node, true);
};

// Attributes or styles can be either an array of names or an object containing name/value pairs
const processFormatAttrOrStyle = (name: string | number, value: FormatAttrOrStyleValue | string, vars: FormatVars | undefined) => {
  // Indexed array
  if (Type.isNumber(name)) {
    return {
      name: value as string,
      value: null
    };
  } else {
    return {
      name,
      value: FormatUtils.replaceVars(value, vars)
    };
  }
};

const removeEmptyStyleAttributeIfNeeded = (dom: DOMUtils, elm: Element) => {
  if (dom.getAttrib(elm, 'style') === '') {
    elm.removeAttribute('style');
    elm.removeAttribute('data-mce-style');
  }
};

const removeStyles = (dom: DOMUtils, elm: Element, format: Format, vars: FormatVars | undefined, compareNode: Node | null | undefined) => {
  let stylesModified = false;

  each(format.styles as any, (value: FormatAttrOrStyleValue | string, name: string | number) => {
    const { name: styleName, value: styleValue } = processFormatAttrOrStyle(name, value, vars);
    const normalizedStyleValue = normalizeStyleValue(styleValue, styleName);

    if (format.remove_similar || Type.isNull(styleValue) || !NodeType.isElement(compareNode) || isEq(FormatUtils.getStyle(dom, compareNode, styleName), normalizedStyleValue)) {
      dom.setStyle(elm, styleName, '');
    }

    stylesModified = true;
  });

  if (stylesModified) {
    removeEmptyStyleAttributeIfNeeded(dom, elm);
  }
};

const removeListStyleFormats = (editor: Editor, name: string, vars: FormatVars | undefined) => {
  if (name === 'removeformat') {
    Arr.each(ListItemFormat.getPartiallySelectedListItems(editor.selection), (li) => {
      Arr.each(ListItemFormat.listItemStyles, (name) => editor.dom.setStyle(li, name, ''));
      removeEmptyStyleAttributeIfNeeded(editor.dom, li);
    });
  } else {
    ListItemFormat.getExpandedListItemFormat(editor.formatter, name).each((liFmt) => {
      Arr.each(ListItemFormat.getPartiallySelectedListItems(editor.selection), (li) => removeStyles(editor.dom, li, liFmt, vars, null));
    });
  }
};

const removeNodeFormatInternal = (ed: Editor, format: Format, vars?: FormatVars, node?: Node, compareNode?: Node | null): RemoveFormatAdt => {
  const dom = ed.dom;
  const elementUtils = ElementUtils(ed);
  const schema = ed.schema;

  // Root level block transparents should get converted into regular text blocks
  if (FormatUtils.isInlineFormat(format) && TransparentElements.isTransparentElementName(schema, format.inline) && TransparentElements.isTransparentBlock(schema, node) && node.parentElement === ed.getBody()) {
    removeNode(ed, node, format);
    return removeResult.removed();
  }

  // Check if node is noneditable and can have the format removed from it
  if (!format.ceFalseOverride && node && dom.getContentEditableParent(node) === 'false') {
    return removeResult.keep();
  }

  // Check if node matches format
  if (node && !MatchFormat.matchName(dom, node, format) && !isColorFormatAndAnchor(node, format)) {
    return removeResult.keep();
  }

  // "matchName" will made sure we're dealing with an element, so cast as one
  const elm = node as Element;

  // Applies to styling elements like strong, em, i, u, etc. so that if they have styling attributes, the attributes can be kept but the styling element is removed
  const preserveAttributes = format.preserve_attributes;
  if (FormatUtils.isInlineFormat(format) && format.remove === 'all' && Type.isArray(preserveAttributes)) {
    // Remove all attributes except for the attributes specified in preserve_attributes
    const attrsToPreserve = Arr.filter(dom.getAttribs(elm), (attr) => Arr.contains(preserveAttributes, attr.name.toLowerCase()));
    dom.removeAllAttribs(elm);
    Arr.each(attrsToPreserve, (attr) => dom.setAttrib(elm, attr.name, attr.value));
    // Note: If there are no attributes left, the element will be removed as normal at the end of the function
    if (attrsToPreserve.length > 0) {
      // Convert inline element to span if necessary
      return removeResult.rename('span');
    }
  }

  // Should we compare with format attribs and styles
  if (format.remove !== 'all') {
    removeStyles(dom, elm, format, vars, compareNode);

    // Remove attributes
    each(format.attributes as any, (value: FormatAttrOrStyleValue | string, name: string | number) => {
      const { name: attrName, value: attrValue } = processFormatAttrOrStyle(name, value, vars);

      if (format.remove_similar || Type.isNull(attrValue) || !NodeType.isElement(compareNode) || isEq(dom.getAttrib(compareNode, attrName), attrValue)) {
        // Keep internal classes
        if (attrName === 'class') {
          const currentValue = dom.getAttrib(elm, attrName);
          if (currentValue) {
            // Build new class value where everything is removed except the internal prefixed classes
            let valueOut = '';
            Arr.each(currentValue.split(/\s+/), (cls) => {
              if (/mce\-\w+/.test(cls)) {
                valueOut += (valueOut ? ' ' : '') + cls;
              }
            });

            // We got some internal classes left
            if (valueOut) {
              dom.setAttrib(elm, attrName, valueOut);
              return;
            }
          }
        }

        // Remove mce prefixed attributes (must clean before short circuit operations)
        if (MCE_ATTR_RE.test(attrName)) {
          elm.removeAttribute('data-mce-' + attrName);
        }

        // keep style="list-style-type: none" on <li>s
        if (attrName === 'style' && NodeType.matchNodeNames([ 'li' ])(elm) && dom.getStyle(elm, 'list-style-type') === 'none') {
          elm.removeAttribute(attrName);
          dom.setStyle(elm, 'list-style-type', 'none');
          return;
        }

        // IE6 has a bug where the attribute doesn't get removed correctly
        if (attrName === 'class') {
          elm.removeAttribute('className');
        }

        elm.removeAttribute(attrName);
      }
    });

    // Remove classes
    each(format.classes, (value) => {
      value = FormatUtils.replaceVars(value, vars);

      if (!NodeType.isElement(compareNode) || dom.hasClass(compareNode, value)) {
        dom.removeClass(elm, value);
      }
    });

    // Check for non internal attributes
    const attrs = dom.getAttribs(elm);
    for (let i = 0; i < attrs.length; i++) {
      const attrName = attrs[i].nodeName;
      if (!elementUtils.isAttributeInternal(attrName)) {
        return removeResult.keep();
      }
    }
  }

  // Remove the inline child if it's empty for example <b> or <span>
  if (format.remove !== 'none') {
    removeNode(ed, elm, format);
    return removeResult.removed();
  }

  return removeResult.keep();
};

const findFormatRoot = (editor: Editor, container: Node, name: string, vars?: FormatVars, similar?: boolean) => {
  let formatRoot: Node | undefined;

  if (container.parentNode) {
    // Find format root
    Arr.each(FormatUtils.getParents(editor.dom, container.parentNode).reverse(), (parent) => {
      // Find format root element
      if (!formatRoot && NodeType.isElement(parent) && parent.id !== '_start' && parent.id !== '_end') {
        // Is the node matching the format we are looking for
        const format = MatchFormat.matchNode(editor, parent, name, vars, similar);
        if (format && format.split !== false) {
          formatRoot = parent;
        }
      }
    });
  }

  return formatRoot;
};

const removeNodeFormatFromClone = (editor: Editor, format: Format, vars: FormatVars | undefined, clone: Node) =>
  removeNodeFormatInternal(editor, format, vars, clone, clone).fold(
    Fun.constant(clone),
    (newName) => {
      // To rename a node, it needs to be a child of another node
      const fragment = editor.dom.createFragment();
      fragment.appendChild(clone);
      // If renaming we are guaranteed this is a Element, so cast
      return editor.dom.rename(clone as Element, newName);
    },
    Fun.constant(null)
  );

const wrapAndSplit = (
  editor: Editor,
  formatList: Format[],
  formatRoot: Node | undefined,
  container: Node,
  target: Node,
  split: boolean,
  format: Format,
  vars?: FormatVars
) => {
  let lastClone: Node | undefined;
  let firstClone: Node | undefined;
  const dom = editor.dom;

  // Format root found then clone formats and split it
  if (formatRoot) {
    const formatRootParent = formatRoot.parentNode;

    for (let parent = container.parentNode; parent && parent !== formatRootParent; parent = parent.parentNode) {
      let clone: Node | null = dom.clone(parent, false);

      for (let i = 0; i < formatList.length; i++) {
        clone = removeNodeFormatFromClone(editor, formatList[i], vars, clone);
        if (clone === null) {
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
      container = dom.split(formatRoot, container) ?? container;
    }

    // Wrap container in cloned formats
    if (lastClone && firstClone) {
      target.parentNode?.insertBefore(lastClone, target);
      firstClone.appendChild(target);

      // After splitting the nodes may match with other siblings so we need to attempt to merge them
      // Note: We can't use MergeFormats, as that'd create a circular dependency
      if (FormatUtils.isInlineFormat(format)) {
        mergeSiblings(editor, format, vars, lastClone);
      }
    }
  }

  return container;
};

const removeFormatInternal = (ed: Editor, name: string, vars?: FormatVars, node?: Node | Range, similar?: boolean): void => {
  const formatList = ed.formatter.get(name) as Format[];
  const format = formatList[0];
  const dom = ed.dom;
  const selection = ed.selection;

  const splitToFormatRoot = (container: Node) => {
    const formatRoot = findFormatRoot(ed, container, name, vars, similar);
    return wrapAndSplit(ed, formatList, formatRoot, container, container, true, format, vars);
  };

  // Make sure to only check for bookmarks created here (eg _start or _end)
  // as there maybe nested bookmarks
  const isRemoveBookmarkNode = (node: Node | null): node is Element =>
    Bookmarks.isBookmarkNode(node) && NodeType.isElement(node) && (node.id === '_start' || node.id === '_end');

  const removeFormatOnNode = (node: Node) =>
    Arr.exists(formatList, (fmt) => removeNodeFormat(ed, fmt, vars, node, node));

  // Merges the styles for each node
  const process = (node: Node) => {

    // Grab the children first since the nodelist might be changed
    const children = Arr.from(node.childNodes);

    // Process current node
    const removed = removeFormatOnNode(node);

    // TINY-6567/TINY-7393: Include the parent if using an expanded selector format and no match was found for the current node
    const currentNodeMatches = removed || Arr.exists(formatList, (f) => MatchFormat.matchName(dom, node, f));
    const parentNode = node.parentNode;
    if (!currentNodeMatches && Type.isNonNullable(parentNode) && FormatUtils.shouldExpandToSelector(format)) {
      removeFormatOnNode(parentNode);
    }

    // Process the children
    if (format.deep) {
      if (children.length) {
        for (let i = 0; i < children.length; i++) {
          process(children[i]);
        }
      }
    }

    // Note: Assists with cleaning up any stray text decorations that may been applied when text decorations
    // and text colors were merged together from an applied format
    // Remove child span if it only contains text-decoration and a parent node also has the same text decoration.
    const textDecorations = [ 'underline', 'line-through', 'overline' ];
    Arr.each(textDecorations, (decoration) => {
      if (NodeType.isElement(node) && ed.dom.getStyle(node, 'text-decoration') === decoration &&
        node.parentNode && FormatUtils.getTextDecoration(dom, node.parentNode) === decoration) {
        removeNodeFormat(ed, {
          deep: false,
          exact: true,
          inline: 'span',
          styles: {
            textDecoration: decoration
          }
        }, undefined, node);
      }
    });
  };

  const unwrap = (start?: boolean) => {
    const node = dom.get(start ? '_start' : '_end');
    if (node) {
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
    } else {
      return null;
    }
  };

  const removeRngStyle = (rng: Range) => {
    let startContainer: Node;
    let endContainer: Node;

    let expandedRng = ExpandRange.expandRng(dom, rng, formatList, rng.collapsed);

    if (format.split) {
      // Split text nodes
      expandedRng = SplitRange.split(expandedRng);

      startContainer = getContainer(ed, expandedRng, true);
      endContainer = getContainer(ed, expandedRng);

      if (startContainer !== endContainer) {
        // WebKit will render the table incorrectly if we wrap a TH or TD in a SPAN
        // so let's see if we can use the first/last child instead
        // This will happen if you triple click a table cell and use remove formatting
        startContainer = normalizeTableSelection(startContainer, true);
        endContainer = normalizeTableSelection(endContainer, false);

        // Wrap and split if nested
        if (isChildOfInlineParent(dom, startContainer, endContainer)) {
          const marker = Optional.from(startContainer.firstChild).getOr(startContainer);
          splitToFormatRoot(wrapWithSiblings(dom, marker, true, 'span', { 'id': '_start', 'data-mce-type': 'bookmark' }));
          unwrap(true);
          return;
        }

        // Wrap and split if nested
        if (isChildOfInlineParent(dom, endContainer, startContainer)) {
          const marker = Optional.from(endContainer.lastChild).getOr(endContainer);
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
        // Note that the return value should always be a node since it's wrapped above
        startContainer = unwrap(true) as Node;
        endContainer = unwrap() as Node;
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
    RangeWalk.walk(dom, expandedRng, (nodes) => {
      Arr.each(nodes, process);
    });
  };

  // Handle node
  if (node) {
    if (FormatUtils.isNode(node)) {
      const rng = dom.createRng();
      rng.setStartBefore(node);
      rng.setEndAfter(node);
      removeRngStyle(rng);
    } else {
      removeRngStyle(node);
    }

    Events.fireFormatRemove(ed, name, node, vars);
    return;
  }

  if (!selection.isCollapsed() || !FormatUtils.isInlineFormat(format) || TableCellSelection.getCellsFromEditor(ed).length) {
    // Remove formatting on the selection
    FormatUtils.preserveSelection(
      ed,
      () => SelectionUtils.runOnRanges(ed, removeRngStyle),
      // Before trying to move the start of the selection, check if start element still has formatting then we are at: "<b>text|</b>text"
      // and need to move the start into the next text node
      (startNode) => FormatUtils.isInlineFormat(format) && MatchFormat.match(ed, name, vars, startNode)
    );

    ed.nodeChanged();
  } else {
    CaretFormat.removeCaretFormat(ed, name, vars, similar);
  }

  removeListStyleFormats(ed, name, vars);

  Events.fireFormatRemove(ed, name, node, vars);

};

const removeFormat = (ed: Editor, name: string, vars?: FormatVars, node?: Node | Range, similar?: boolean): void => {
  if (node || ed.selection.isEditable()) {
    removeFormatInternal(ed, name, vars, node, similar);
  }
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
const removeNodeFormat = (editor: Editor, format: Format, vars: FormatVars | undefined, node: Node, compareNode?: Node | null): boolean => {
  return removeNodeFormatInternal(editor, format, vars, node, compareNode).fold(
    Fun.never,
    (newName) => {
      // If renaming we are guaranteed this is a Element, so cast
      editor.dom.rename(node as Element, newName);
      return true;
    },
    Fun.always
  );
};

export {
  removeFormat,
  removeNodeFormat
};
