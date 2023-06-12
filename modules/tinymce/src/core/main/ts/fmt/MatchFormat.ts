import { Arr, Obj, Optional, Strings, Type } from '@ephox/katamari';
import { Compare, SugarElement, TransformFind } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as ArrUtils from '../util/ArrUtils';
import { Format, FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';

const isEq = FormatUtils.isEq;

const matchesUnInheritedFormatSelector = (ed: Editor, node: Node, name: string): boolean => {
  const formatList = ed.formatter.get(name);

  if (formatList) {
    for (let i = 0; i < formatList.length; i++) {
      const format = formatList[i];
      if (FormatUtils.isSelectorFormat(format) && format.inherit === false && ed.dom.is(node, format.selector)) {
        return true;
      }
    }
  }

  return false;
};

const matchParents = (editor: Editor, node: Node, name: string, vars?: FormatVars, similar?: boolean): boolean => {
  const root = editor.dom.getRoot();

  if (node === root) {
    return false;
  }

  // Find first node with similar format settings
  const matchedNode = editor.dom.getParent(node, (elm) => {
    if (matchesUnInheritedFormatSelector(editor, elm, name)) {
      return true;
    }

    return elm.parentNode === root || !!matchNode(editor, elm, name, vars, true);
  });

  // Do an exact check on the similar format element
  return !!matchNode(editor, matchedNode, name, vars, similar);
};

const matchName = (dom: DOMUtils, node: Node | null | undefined, format: Format): boolean => {
  // Check for inline match
  if (FormatUtils.isInlineFormat(format) && isEq(node, format.inline)) {
    return true;
  }

  // Check for block match
  if (FormatUtils.isBlockFormat(format) && isEq(node, format.block)) {
    return true;
  }

  // Check for selector match
  if (FormatUtils.isSelectorFormat(format)) {
    return NodeType.isElement(node) && dom.is(node, format.selector);
  }

  return false;
};

const matchItems = (dom: DOMUtils, node: Element, format: Format, itemName: 'attributes' | 'styles', similar?: boolean, vars?: FormatVars): boolean => {
  const items = format[itemName];
  const matchAttributes = itemName === 'attributes';

  // Custom match
  if (Type.isFunction(format.onmatch)) {
    // onmatch is generic in a way that we can't really express without casting
    return format.onmatch(node, format as any, itemName);
  }

  // Check all items
  if (items) {
    // Non indexed object
    if (!ArrUtils.isArrayLike(items)) {
      for (const key in items) {
        if (Obj.has(items, key)) {
          const value = matchAttributes ? dom.getAttrib(node, key) : FormatUtils.getStyle(dom, node, key);
          const expectedValue = FormatUtils.replaceVars(items[key], vars);
          const isEmptyValue = Type.isNullable(value) || Strings.isEmpty(value);

          if (isEmptyValue && Type.isNullable(expectedValue)) {
            continue;
          }

          if (similar && isEmptyValue && !format.exact) {
            return false;
          }

          if ((!similar || format.exact) && !isEq(value, FormatUtils.normalizeStyleValue(expectedValue, key))) {
            return false;
          }
        }
      }
    } else {
      // Only one match needed for indexed arrays
      for (let i = 0; i < items.length; i++) {
        if (matchAttributes ? dom.getAttrib(node, items[i]) : FormatUtils.getStyle(dom, node, items[i])) {
          return true;
        }
      }
    }
  }

  return true;
};

const matchNode = (ed: Editor, node: Node | null, name: string, vars?: FormatVars, similar?: boolean): Format | undefined => {
  const formatList = ed.formatter.get(name);
  const dom = ed.dom;

  if (formatList && NodeType.isElement(node)) {
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

  return undefined;
};

const match = (editor: Editor, name: string, vars?: FormatVars, node?: Node, similar?: boolean): boolean => {
  // Check specified node
  if (node) {
    return matchParents(editor, node, name, vars, similar);
  }

  // Check selected node
  node = editor.selection.getNode();
  if (matchParents(editor, node, name, vars, similar)) {
    return true;
  }

  // Check start node if it's different
  const startNode = editor.selection.getStart();
  if (startNode !== node) {
    if (matchParents(editor, startNode, name, vars, similar)) {
      return true;
    }
  }

  return false;
};

const matchAll = (editor: Editor, names: string[], vars?: FormatVars): string[] => {
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

const canApply = (editor: Editor, name: string): boolean => {
  const formatList = editor.formatter.get(name);
  const dom = editor.dom;

  if (formatList && editor.selection.isEditable()) {
    const startNode = editor.selection.getStart();
    const parents = FormatUtils.getParents(dom, startNode);

    for (let x = formatList.length - 1; x >= 0; x--) {
      const format = formatList[x];

      // Format is not selector based then always return TRUE
      if (!FormatUtils.isSelectorFormat(format)) {
        return true;
      }

      for (let i = parents.length - 1; i >= 0; i--) {
        if (dom.is(parents[i], format.selector)) {
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
const matchAllOnNode = (editor: Editor, node: Node, formatNames: string[]): string[] =>
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
