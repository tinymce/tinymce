/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Type } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as Whitespace from '../text/Whitespace';
import { ApplyFormat, BlockFormat, Format, FormatAttrOrStyleValue, FormatVars, InlineFormat, SelectorFormat } from './FormatTypes';

const isNode = (node: any): node is Node => !!(node).nodeType;

const isInlineBlock = function (node: Node): boolean {
  return node && /^(IMG)$/.test(node.nodeName);
};

const moveStart = function (dom: DOMUtils, selection: EditorSelection, rng: Range) {
  const offset = rng.startOffset;
  let container = rng.startContainer, walker, node, nodes;

  if (rng.startContainer === rng.endContainer) {
    if (isInlineBlock(rng.startContainer.childNodes[rng.startOffset])) {
      return;
    }
  }

  // Move startContainer/startOffset in to a suitable node
  if (container.nodeType === 1) {
    nodes = container.childNodes;
    if (offset < nodes.length) {
      container = nodes[offset];
      walker = new DomTreeWalker(container, dom.getParent(container, dom.isBlock));
    } else {
      container = nodes[nodes.length - 1];
      walker = new DomTreeWalker(container, dom.getParent(container, dom.isBlock));
      walker.next(true);
    }

    for (node = walker.current(); node; node = walker.next()) {
      if (node.nodeType === 3 && !isWhiteSpaceNode(node)) {
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
 * @param {boolean} next (Optional) Include next or previous node defaults to previous.
 * @param {boolean} inc (Optional) Include the current node in checking. Defaults to false.
 * @return {Node} Next or previous node or undefined if it wasn't found.
 */
const getNonWhiteSpaceSibling = function (node: Node, next?: boolean, inc?: boolean) {
  if (node) {
    const nextName = next ? 'nextSibling' : 'previousSibling';

    for (node = inc ? node : node[nextName]; node; node = node[nextName]) {
      if (node.nodeType === 1 || !isWhiteSpaceNode(node)) {
        return node;
      }
    }
  }
};

const isTextBlock = function (editor: Editor, name: string | Node) {
  if (isNode(name)) {
    name = name.nodeName;
  }

  return !!editor.schema.getTextBlockElements()[name.toLowerCase()];
};

const isValid = function (ed: Editor, parent: string, child: string) {
  return ed.schema.isValidChild(parent, child);
};

const isWhiteSpaceNode = function (node: Node | null, allowSpaces: boolean = false) {
  if (Type.isNonNullable(node) && NodeType.isText(node)) {
    // If spaces are allowed, treat them as a non-breaking space
    const data = allowSpaces ? node.data.replace(/ /g, '\u00a0') : node.data;
    return Whitespace.isWhitespaceText(data);
  } else {
    return false;
  }
};

const isEmptyTextNode = function (node: Node | null) {
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
const replaceVars = function (value: FormatAttrOrStyleValue, vars: FormatVars): string {
  if (typeof value !== 'string') {
    value = value(vars);
  } else if (vars) {
    value = value.replace(/%(\w+)/g, function (str, name) {
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
 * @return {boolean} True/false if they match.
 */
const isEq = function (str1, str2) {
  str1 = str1 || '';
  str2 = str2 || '';

  str1 = '' + (str1.nodeName || str1);
  str2 = '' + (str2.nodeName || str2);

  return str1.toLowerCase() === str2.toLowerCase();
};

const normalizeStyleValue = function (dom: DOMUtils, value, name: string) {
  // Force the format to hex
  if (name === 'color' || name === 'backgroundColor') {
    value = dom.toHex(value);
  }

  // Opera will return bold as 700
  if (name === 'fontWeight' && value === 700) {
    value = 'bold';
  }

  // Normalize fontFamily so "'Font name', Font" becomes: "Font name,Font"
  if (name === 'fontFamily') {
    value = value.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
  }

  return '' + value;
};

const getStyle = function (dom: DOMUtils, node: Node, name: string) {
  return normalizeStyleValue(dom, dom.getStyle(node, name), name);
};

const getTextDecoration = function (dom: DOMUtils, node: Node): string {
  let decoration;

  dom.getParent(node, function (n) {
    decoration = dom.getStyle(n, 'text-decoration');
    return decoration && decoration !== 'none';
  });

  return decoration;
};

const getParents = function (dom: DOMUtils, node: Node, selector?: string) {
  return dom.getParents(node, selector, dom.getRoot());
};

const isVariableFormatName = (editor: Editor, formatName: string): boolean => {
  const hasVariableValues = (format: Format) => {
    const isVariableValue = (val: string): boolean => val.length > 1 && val.charAt(0) === '%';
    return Arr.exists([ 'styles', 'attributes' ], (key: 'styles' | 'attributes') =>
      Obj.get(format, key).exists((field) => {
        const fieldValues = Type.isArray(field) ? field : Obj.values(field);
        return Arr.exists(fieldValues, isVariableValue);
      }));
  };
  return Arr.exists(editor.formatter.get(formatName), hasVariableValues);
};

/**
 * Checks if the two formats are similar based on the format type, attributes, styles and classes
 */
const areSimilarFormats = (editor: Editor, formatName: string, otherFormatName: string) => {
  // Note: MatchFormat.matchNode() uses these parameters to check if a format matches a node
  // Therefore, these are ideal to check if two formats are similar
  const validKeys = [ 'inline', 'block', 'selector', 'attributes', 'styles', 'classes' ];
  const filterObj = (format: Record<string, any>) => Obj.filter(format, (_, key) => Arr.exists(validKeys, (validKey) => validKey === key));
  return Arr.exists(editor.formatter.get(formatName), (fmt1) => {
    const filteredFmt1 = filterObj(fmt1);
    return Arr.exists(editor.formatter.get(otherFormatName), (fmt2) => {
      const filteredFmt2 = filterObj(fmt2);
      return Obj.equal(filteredFmt1, filteredFmt2);
    });
  });
};

const isBlockFormat = (format: ApplyFormat): format is BlockFormat =>
  Obj.hasNonNullableKey(format as any, 'block');

// TODO: is this correct? As a "mixed" format has both `selector` and `inline` properties
const isSelectorFormat = (format: ApplyFormat): format is SelectorFormat =>
  Obj.hasNonNullableKey(format as any, 'selector');

// TODO: is this correct? As a "mixed" format has both `selector` and `inline` properties
const isInlineFormat = (format: ApplyFormat): format is InlineFormat =>
  Obj.hasNonNullableKey(format as any, 'inline');

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
  isBlockFormat
};
