/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional } from '@ephox/katamari';
import { Compare, SugarElement, TransformFind } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import { Format, FormatVars, SelectorFormat } from './FormatTypes';
import * as FormatUtils from './FormatUtils';

const isEq = FormatUtils.isEq;

const matchesUnInheritedFormatSelector = (ed: Editor, node: Node, name: string) => {
  // TODO: Is this safe? it doesn't look like it is this could be a block or inline format
  const formatList = ed.formatter.get(name) as SelectorFormat[];

  if (formatList) {
    for (let i = 0; i < formatList.length; i++) {
      if (formatList[i].inherit === false && ed.dom.is(node, formatList[i].selector)) {
        return true;
      }
    }
  }

  return false;
};

const matchParents = (editor: Editor, node: Node, name: string, vars: FormatVars): boolean => {
  const root = editor.dom.getRoot();

  if (node === root) {
    return false;
  }

  // Find first node with similar format settings
  node = editor.dom.getParent(node, (node) => {
    if (matchesUnInheritedFormatSelector(editor, node, name)) {
      return true;
    }

    return node.parentNode === root || !!matchNode(editor, node, name, vars, true);
  });

  // Do an exact check on the similar format element
  return !!matchNode(editor, node, name, vars);
};

const matchName = (dom: DOMUtils, node: Node, format) => {
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
    return node.nodeType === 1 && dom.is(node, format.selector);
  }
};

const matchItems = (dom: DOMUtils, node: Node, format: Format, itemName: string, similar: boolean, vars: FormatVars): boolean => {
  const items = format[itemName];

  // Custom match
  if (format.onmatch) {
    const onMatch: (node: Node, format: Format, name: string) => boolean = format.onmatch;
    return onMatch(node, format, itemName);
  }

  // Check all items
  if (items) {
    // Non indexed object
    if (typeof items.length === 'undefined') {
      for (const key in items) {
        if (Obj.has(items, key)) {
          const value = itemName === 'attributes' ? dom.getAttrib(node, key) : FormatUtils.getStyle(dom, node, key);
          const expectedValue = FormatUtils.replaceVars(items[key], vars);

          if (!value && !expectedValue) {
            continue;
          }

          if (similar && !value && !format.exact) {
            return undefined;
          }

          if ((!similar || format.exact) && !isEq(value, FormatUtils.normalizeStyleValue(dom, expectedValue, key))) {
            return undefined;
          }
        }
      }
    } else {
      // Only one match needed for indexed arrays
      for (let i = 0; i < items.length; i++) {
        if (itemName === 'attributes' ? dom.getAttrib(node, items[i]) : FormatUtils.getStyle(dom, node, items[i])) {
          return true;
        }
      }
    }
  }

  return true;
};

const matchNode = (ed: Editor, node: Node, name: string, vars?: FormatVars, similar?: boolean): Format | undefined => {
  const formatList = ed.formatter.get(name);
  const dom = ed.dom;

  if (formatList && node) {
    // Check each format in list
    for (let i = 0; i < formatList.length; i++) {
      const format = formatList[i];

      // Name name, attributes, styles and classes
      if (matchName(ed.dom, node, format) && matchItems(dom, node, format, 'attributes', similar, vars) && matchItems(dom, node, format, 'styles', similar, vars)) {
        // Match classes
        const classes = format.classes;
        if (classes) {
          for (let x = 0; x < classes.length; x++) {
            if (!ed.dom.hasClass(node, FormatUtils.replaceVars(classes[x], vars))) {
              return;
            }
          }
        }

        return format;
      }
    }
  }
};

const match = (editor: Editor, name: string, vars: FormatVars, node?: Node): boolean => {
  // Check specified node
  if (node) {
    return matchParents(editor, node, name, vars);
  }

  // Check selected node
  node = editor.selection.getNode();
  if (matchParents(editor, node, name, vars)) {
    return true;
  }

  // Check start node if it's different
  const startNode = editor.selection.getStart();
  if (startNode !== node) {
    if (matchParents(editor, startNode, name, vars)) {
      return true;
    }
  }

  return false;
};

const matchAll = (editor: Editor, names: string[], vars: FormatVars) => {
  const matchedFormatNames: string[] = [];
  const checkedMap: Record<string, boolean> = {};

  // Check start of selection for formats
  const startElement = editor.selection.getStart();
  editor.dom.getParent(startElement, (node) => {
    for (let i = 0; i < names.length; i++) {
      const name = names[i];

      if (!checkedMap[name] && matchNode(editor, node, name, vars)) {
        checkedMap[name] = true;
        matchedFormatNames.push(name);
      }
    }
  }, editor.dom.getRoot());

  return matchedFormatNames;
};

const closest = (editor: Editor, names: string[]): string | null => {
  const isRoot = (elm: SugarElement<Node>) => Compare.eq(elm, SugarElement.fromDom(editor.getBody()));
  const match = (elm: SugarElement<Node>, name: string): Optional<string> => matchNode(editor, elm.dom, name) ? Optional.some(name) : Optional.none();
  return Optional.from(editor.selection.getStart(true)).bind((rawElm) =>
    TransformFind.closest(SugarElement.fromDom(rawElm), (elm) => Arr.findMap(names, (name) => match(elm, name)), isRoot)
  ).getOrNull();
};

const canApply = (editor: Editor, name: string) => {
  const formatList = editor.formatter.get(name);
  let startNode, parents, i, x, selector;
  const dom = editor.dom;

  if (formatList) {
    startNode = editor.selection.getStart();
    parents = FormatUtils.getParents(dom, startNode);

    for (x = formatList.length - 1; x >= 0; x--) {
      selector = (formatList[x] as SelectorFormat).selector;

      // Format is not selector based then always return TRUE
      // Is it has a defaultBlock then it's likely it can be applied for example align on a non block element line
      if (!selector || (formatList[x] as SelectorFormat).defaultBlock) {
        return true;
      }

      for (i = parents.length - 1; i >= 0; i--) {
        if (dom.is(parents[i], selector)) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 *  Get all of the format names present on the specified node
 */
const matchAllOnNode = (editor: Editor, node: Node, formatNames: string[]) =>
  Arr.foldl(formatNames, (acc, name) => {
    const matchSimilar = FormatUtils.isVariableFormatName(editor, name);
    if (editor.formatter.matchNode(node, name, {}, matchSimilar)) {
      return acc.concat([ name ]);
    } else {
      return acc;
    }
  }, [] as string[]);

export {
  matchNode,
  matchName,
  match,
  closest,
  matchAll,
  matchAllOnNode,
  canApply,
  matchesUnInheritedFormatSelector
};
