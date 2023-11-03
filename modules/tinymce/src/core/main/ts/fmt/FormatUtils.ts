import { Transformations } from '@ephox/acid';
import { Arr, Obj, Optionals, Strings, Type } from '@ephox/katamari';
import { Selectors, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as Options from '../api/Options';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as TransparentElements from '../content/TransparentElements';
import * as NodeType from '../dom/NodeType';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as Whitespace from '../text/Whitespace';
import { ZWSP } from '../text/Zwsp';
import { isCaretNode } from './FormatContainer';
import { BlockFormat, Format, FormatAttrOrStyleValue, FormatVars, InlineFormat, MixedFormat, SelectorFormat } from './FormatTypes';

const isNode = (node: any): node is Node =>
  Type.isNumber(node?.nodeType);

const isElementNode = (node: Node): node is Element =>
  NodeType.isElement(node) && !Bookmarks.isBookmarkNode(node) && !isCaretNode(node) && !NodeType.isBogus(node);

// In TinyMCE, directly selected elements are indicated with the data-mce-selected attribute
// Elements that can be directly selected include control elements such as img, media elements, noneditable elements and others
const isElementDirectlySelected = (dom: DOMUtils, node: Node): boolean => {
  // Table cells are a special case and are separately handled from native editor selection
  if (isElementNode(node) && !/^(TD|TH)$/.test(node.nodeName)) {
    const selectedAttr = dom.getAttrib(node, 'data-mce-selected');
    const value = parseInt(selectedAttr, 10);
    // Avoid cases where data-mce-selected is not a positive number e.g. inline-boundary
    return !isNaN(value) && value > 0;
  } else {
    return false;
  }
};

// TODO: TINY-9130 Look at making SelectionUtils.preserve maintain the noneditable selection instead
const preserveSelection = (editor: Editor, action: () => void, shouldMoveStart: (startNode: Node) => boolean): void => {
  const { selection, dom } = editor;
  const selectedNodeBeforeAction = selection.getNode();
  const isSelectedBeforeNodeNoneditable = NodeType.isContentEditableFalse(selectedNodeBeforeAction);

  SelectionUtils.preserve(selection, true, () => {
    action();
  });

  // Check previous selected node before the action still exists in the DOM
  // and is still noneditable
  const isBeforeNodeStillNoneditable = isSelectedBeforeNodeNoneditable && NodeType.isContentEditableFalse(selectedNodeBeforeAction);
  if (isBeforeNodeStillNoneditable && dom.isChildOf(selectedNodeBeforeAction, editor.getBody())) {
    editor.selection.select(selectedNodeBeforeAction);
  } else if (shouldMoveStart(selection.getStart())) {
    moveStartToNearestText(dom, selection);
  }
};

// Note: The reason why we only care about moving the start is because MatchFormat and its function use the start of the selection to determine if a selection has a given format or not
const moveStartToNearestText = (dom: DOMUtils, selection: EditorSelection): void => {
  const rng = selection.getRng();
  const { startContainer, startOffset } = rng;
  const selectedNode = selection.getNode();

  if (isElementDirectlySelected(dom, selectedNode)) {
    return;
  }

  // Try move startContainer/startOffset to a suitable text node
  if (NodeType.isElement(startContainer)) {
    const nodes = startContainer.childNodes;
    const root = dom.getRoot();
    let walker: DomTreeWalker;
    if (startOffset < nodes.length) {
      const startNode = nodes[startOffset];
      walker = new DomTreeWalker(startNode, dom.getParent(startNode, dom.isBlock) ?? root);
    } else {
      const startNode = nodes[nodes.length - 1];
      walker = new DomTreeWalker(startNode, dom.getParent(startNode, dom.isBlock) ?? root);
      walker.next(true);
    }

    for (let node = walker.current(); node; node = walker.next()) {
      // If we have found a noneditable element before we have found any text
      // then we cannot move forward any further as otherwise the start could be put inside
      // the non-editable element which is not valid
      if (dom.getContentEditable(node) === 'false') {
        return;
      } else if (NodeType.isText(node) && !isWhiteSpaceNode(node)) {
        rng.setStart(node, 0);
        selection.setRng(rng);

        return;
      }
    }
  }
};

/**
 * Returns the next/previous non whitespace node.
 *
 * @private
 * @param {Node} node Node to start at.
 * @param {Boolean} next (Optional) Include next or previous node defaults to previous.
 * @param {Boolean} inc (Optional) Include the current node in checking. Defaults to false.
 * @return {Node} Next or previous node or undefined if it wasn't found.
 */
const getNonWhiteSpaceSibling = (node: Node | null, next?: boolean, inc?: boolean): Node | undefined => {
  if (node) {
    const nextName = next ? 'nextSibling' : 'previousSibling';

    for (node = inc ? node : node[nextName]; node; node = node[nextName]) {
      if (NodeType.isElement(node) || !isWhiteSpaceNode(node)) {
        return node;
      }
    }
  }

  return undefined;
};

const isTextBlock = (schema: Schema, node: Node): boolean =>
  !!schema.getTextBlockElements()[node.nodeName.toLowerCase()] || TransparentElements.isTransparentBlock(schema, node);

const isValid = (ed: Editor, parent: string, child: string): boolean => {
  return ed.schema.isValidChild(parent, child);
};

const isWhiteSpaceNode = (node: Node | null, allowSpaces: boolean = false): boolean => {
  if (Type.isNonNullable(node) && NodeType.isText(node)) {
    // If spaces are allowed, treat them as a non-breaking space
    const data = allowSpaces ? node.data.replace(/ /g, '\u00a0') : node.data;
    return Whitespace.isWhitespaceText(data);
  } else {
    return false;
  }
};

const isEmptyTextNode = (node: Node | null): boolean => {
  return Type.isNonNullable(node) && NodeType.isText(node) && node.length === 0;
};

const isWrapNoneditableTarget = (editor: Editor, node: Node): boolean => {
  const baseDataSelector = '[data-mce-cef-wrappable]';
  const formatNoneditableSelector = Options.getFormatNoneditableSelector(editor);
  const selector = Strings.isEmpty(formatNoneditableSelector) ? baseDataSelector : `${baseDataSelector},${formatNoneditableSelector}`;
  return Selectors.is(SugarElement.fromDom(node), selector);
};

// A noneditable element is wrappable if it:
// - is valid target (has data-mce-cef-wrappable attribute or matches selector from option)
// - has no editable descendants - removing formats in the editable region can result in the wrapped noneditable being split which is undesirable
const isWrappableNoneditable = (editor: Editor, node: Node): boolean => {
  const dom = editor.dom;

  return (
    isElementNode(node) &&
    dom.getContentEditable(node) === 'false' &&
    isWrapNoneditableTarget(editor, node) &&
    dom.select('[contenteditable="true"]', node).length === 0
  );
};

/**
 * Replaces variables in the value. The variable format is %var.
 *
 * @private
 * @param {String} value Value to replace variables in.
 * @param {Object} vars Name/value array with variables to replace.
 * @return {String} New value with replaced variables.
 */
const replaceVars: {
  (value: string, vars?: FormatVars): string;
  (value: FormatAttrOrStyleValue, vars?: FormatVars): string | null;
} = (value: FormatAttrOrStyleValue, vars?: FormatVars): any => {
  if (Type.isFunction(value)) {
    return value(vars);
  } else if (Type.isNonNullable(vars)) {
    value = value.replace(/%(\w+)/g, (str, name) => {
      return vars[name] || str;
    });
  }

  return value;
};

/**
 * Compares two string/nodes regardless of their case.
 *
 * @private
 * @param {String/Node} str1 Node or string to compare.
 * @param {String/Node} str2 Node or string to compare.
 * @return {Boolean} True/false if they match.
 */
const isEq = (str1: Node | string | null | undefined, str2: Node | string | null | undefined): boolean => {
  str1 = str1 || '';
  str2 = str2 || '';

  str1 = '' + ((str1 as Node).nodeName || str1);
  str2 = '' + ((str2 as Node).nodeName || str2);

  return str1.toLowerCase() === str2.toLowerCase();
};

const normalizeStyleValue = (value: string | number | null | undefined, name: string): string | null => {
  if (Type.isNullable(value)) {
    return null;
  } else {
    let strValue = String(value);

    // Force the format to hex
    if (name === 'color' || name === 'backgroundColor') {
      strValue = Transformations.rgbaToHexString(strValue);
    }

    // Opera will return bold as 700
    if (name === 'fontWeight' && value === 700) {
      strValue = 'bold';
    }

    // Normalize fontFamily so "'Font name', Font" becomes: "Font name,Font"
    if (name === 'fontFamily') {
      strValue = strValue.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
    }

    return strValue;
  }
};

const getStyle = (dom: DOMUtils, node: Element, name: string): string | null => {
  const style = dom.getStyle(node, name);
  return normalizeStyleValue(style, name);
};

const getTextDecoration = (dom: DOMUtils, node: Node): string | undefined => {
  let decoration: string | undefined;

  dom.getParent(node, (n): boolean => {
    if (NodeType.isElement(n)) {
      decoration = dom.getStyle(n, 'text-decoration');
      return !!decoration && decoration !== 'none';
    } else {
      return false;
    }
  });

  return decoration;
};

const getParents = (dom: DOMUtils, node: Node, selector?: string): Node[] => {
  return dom.getParents(node, selector, dom.getRoot());
};

const isFormatPredicate = (editor: Editor, formatName: string, predicate: (format: Format) => boolean): boolean => {
  const formats = editor.formatter.get(formatName);
  return Type.isNonNullable(formats) && Arr.exists(formats, predicate);
};

const isVariableFormatName = (editor: Editor, formatName: string): boolean => {
  const hasVariableValues = (format: Format) => {
    const isVariableValue = (val: FormatAttrOrStyleValue): boolean => Type.isFunction(val) || val.length > 1 && val.charAt(0) === '%';
    return Arr.exists([ 'styles', 'attributes' ], (key: 'styles' | 'attributes') =>
      Obj.get(format, key).exists((field) => {
        const fieldValues = Type.isArray(field) ? field : Obj.values(field);
        return Arr.exists(fieldValues, isVariableValue);
      }));
  };

  return isFormatPredicate(editor, formatName, hasVariableValues);
};

/**
 * Checks if the two formats are similar based on the format type, attributes, styles and classes
 */
const areSimilarFormats = (editor: Editor, formatName: string, otherFormatName: string): boolean => {
  // Note: MatchFormat.matchNode() uses these parameters to check if a format matches a node
  // Therefore, these are ideal to check if two formats are similar
  const validKeys = [ 'inline', 'block', 'selector', 'attributes', 'styles', 'classes' ];
  const filterObj = (format: Record<string, any>) => Obj.filter(format, (_, key) => Arr.exists(validKeys, (validKey) => validKey === key));
  return isFormatPredicate(editor, formatName, (fmt1) => {
    const filteredFmt1 = filterObj(fmt1);
    return isFormatPredicate(editor, otherFormatName, (fmt2) => {
      const filteredFmt2 = filterObj(fmt2);
      return Obj.equal(filteredFmt1, filteredFmt2);
    });
  });
};

const isBlockFormat = (format: Format): format is BlockFormat =>
  Obj.hasNonNullableKey(format as any, 'block');

const isWrappingBlockFormat = (format: Format): format is BlockFormat =>
  isBlockFormat(format) && format.wrapper === true;

const isNonWrappingBlockFormat = (format: Format): format is BlockFormat =>
  isBlockFormat(format) && format.wrapper !== true;

const isSelectorFormat = (format: Format): format is SelectorFormat =>
  Obj.hasNonNullableKey(format as any, 'selector');

const isInlineFormat = (format: Format): format is InlineFormat =>
  Obj.hasNonNullableKey(format as any, 'inline');

const isMixedFormat = (format: any): format is MixedFormat =>
  isSelectorFormat(format) && isInlineFormat(format) && Optionals.is(Obj.get(format, 'mixed'), true);

const shouldExpandToSelector = (format: Format): boolean =>
  isSelectorFormat(format) && format.expand !== false && !isInlineFormat(format);

const getEmptyCaretContainers = (node: Node) => {
  const nodes: Element[] = [];

  let tempNode: Node | null = node;
  while (tempNode) {
    if ((NodeType.isText(tempNode) && tempNode.data !== ZWSP) || tempNode.childNodes.length > 1) {
      return [];
    }

    // Collect nodes
    if (NodeType.isElement(tempNode)) {
      nodes.push(tempNode);
    }

    tempNode = tempNode.firstChild;
  }

  return nodes;
};

const isCaretContainerEmpty = (node: Node): boolean => {
  return getEmptyCaretContainers(node).length > 0;
};

const isEmptyCaretFormatElement = (element: SugarElement<Node>): boolean => {
  return isCaretNode(element.dom) && isCaretContainerEmpty(element.dom);
};

export {
  isNode,
  isElementNode,
  preserveSelection,
  getNonWhiteSpaceSibling,
  isTextBlock,
  isValid,
  isWhiteSpaceNode,
  isEmptyTextNode,
  isWrappableNoneditable,
  replaceVars,
  isEq,
  normalizeStyleValue,
  getStyle,
  getTextDecoration,
  getParents,
  isVariableFormatName,
  areSimilarFormats,
  isSelectorFormat,
  isInlineFormat,
  isBlockFormat,
  isWrappingBlockFormat,
  isNonWrappingBlockFormat,
  isMixedFormat,
  shouldExpandToSelector,
  isCaretContainerEmpty,
  isEmptyCaretFormatElement
};
