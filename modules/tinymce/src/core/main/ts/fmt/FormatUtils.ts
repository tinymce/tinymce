import { Transformations } from '@ephox/acid';
import { Arr, Obj, Optionals, Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as Whitespace from '../text/Whitespace';
import { BlockFormat, Format, FormatAttrOrStyleValue, FormatVars, InlineFormat, MixedFormat, SelectorFormat } from './FormatTypes';

const isNode = (node: any): node is Node => !!(node).nodeType;

const isInlineBlock = (node: Node): boolean => {
  return node && /^(IMG)$/.test(node.nodeName);
};

const moveStart = (dom: DOMUtils, selection: EditorSelection, rng: Range): void => {
  const offset = rng.startOffset;
  let container = rng.startContainer;

  if (container === rng.endContainer) {
    if (isInlineBlock(container.childNodes[offset])) {
      return;
    }
  }

  // Move startContainer/startOffset in to a suitable node
  if (NodeType.isElement(container)) {
    const nodes = container.childNodes;
    const root = dom.getRoot();
    let walker: DomTreeWalker;
    if (offset < nodes.length) {
      container = nodes[offset];
      walker = new DomTreeWalker(container, dom.getParent(container, dom.isBlock) ?? root);
    } else {
      container = nodes[nodes.length - 1];
      walker = new DomTreeWalker(container, dom.getParent(container, dom.isBlock) ?? root);
      walker.next(true);
    }

    for (let node = walker.current(); node; node = walker.next()) {
      if (NodeType.isText(node) && !isWhiteSpaceNode(node)) {
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

const isTextBlock = (editor: Editor, name: string | Node): boolean => {
  if (isNode(name)) {
    name = name.nodeName;
  }

  return !!editor.schema.getTextBlockElements()[name.toLowerCase()];
};

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

const normalizeStyleValue = (value: string | number, name: string): string => {
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
};

const getStyle = (dom: DOMUtils, node: Node, name: string): string | undefined => {
  const style = dom.getStyle(node, name);
  return style ? normalizeStyleValue(style, name) : style;
};

const getTextDecoration = (dom: DOMUtils, node: Node): string | undefined => {
  let decoration: string | undefined;

  dom.getParent(node, (n): boolean => {
    decoration = dom.getStyle(n, 'text-decoration');
    return !!decoration && decoration !== 'none';
  });

  return decoration;
};

const getParents = (dom: DOMUtils, node: Node, selector?: string): Element[] => {
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

const isSelectorFormat = (format: Format): format is SelectorFormat =>
  Obj.hasNonNullableKey(format as any, 'selector');

const isInlineFormat = (format: Format): format is InlineFormat =>
  Obj.hasNonNullableKey(format as any, 'inline');

const isMixedFormat = (format: Format): format is MixedFormat =>
  isSelectorFormat(format) && isInlineFormat(format) && Optionals.is(Obj.get(format as any, 'mixed'), true);

const shouldExpandToSelector = (format: Format): boolean =>
  isSelectorFormat(format) && format.expand !== false && !isInlineFormat(format);

export {
  isNode,
  isInlineBlock,
  moveStart,
  getNonWhiteSpaceSibling,
  isTextBlock,
  isValid,
  isWhiteSpaceNode,
  isEmptyTextNode,
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
  isMixedFormat,
  shouldExpandToSelector
};
