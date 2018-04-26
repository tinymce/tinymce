/**
 * MatchFormat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import FormatUtils from './FormatUtils';

const isEq = FormatUtils.isEq;

const matchesUnInheritedFormatSelector = function (ed, node, name) {
  const formatList = ed.formatter.get(name);

  if (formatList) {
    for (let i = 0; i < formatList.length; i++) {
      if (formatList[i].inherit === false && ed.dom.is(node, formatList[i].selector)) {
        return true;
      }
    }
  }

  return false;
};

const matchParents = function (editor, node, name, vars) {
  const root = editor.dom.getRoot();

  if (node === root) {
    return false;
  }

  // Find first node with similar format settings
  node = editor.dom.getParent(node, function (node) {
    if (matchesUnInheritedFormatSelector(editor, node, name)) {
      return true;
    }

    return node.parentNode === root || !!matchNode(editor, node, name, vars, true);
  });

  // Do an exact check on the similar format element
  return matchNode(editor, node, name, vars);
};

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
    return node.nodeType === 1 && dom.is(node, format.selector);
  }
};

const matchItems = function (dom, node, format, itemName, similar, vars) {
  let key, value;
  const items = format[itemName];
  let i;

  // Custom match
  if (format.onmatch) {
    return format.onmatch(node, format, itemName);
  }

  // Check all items
  if (items) {
    // Non indexed object
    if (typeof items.length === 'undefined') {
      for (key in items) {
        if (items.hasOwnProperty(key)) {
          if (itemName === 'attributes') {
            value = dom.getAttrib(node, key);
          } else {
            value = FormatUtils.getStyle(dom, node, key);
          }

          if (similar && !value && !format.exact) {
            return;
          }

          if ((!similar || format.exact) && !isEq(value, FormatUtils.normalizeStyleValue(dom, FormatUtils.replaceVars(items[key], vars), key))) {
            return;
          }
        }
      }
    } else {
      // Only one match needed for indexed arrays
      for (i = 0; i < items.length; i++) {
        if (itemName === 'attributes' ? dom.getAttrib(node, items[i]) : FormatUtils.getStyle(dom, node, items[i])) {
          return format;
        }
      }
    }
  }

  return format;
};

const matchNode = function (ed, node, name, vars?, similar?) {
  const formatList = ed.formatter.get(name);
  let format, i, x, classes;
  const dom = ed.dom;

  if (formatList && node) {
    // Check each format in list
    for (i = 0; i < formatList.length; i++) {
      format = formatList[i];

      // Name name, attributes, styles and classes
      if (matchName(ed.dom, node, format) && matchItems(dom, node, format, 'attributes', similar, vars) && matchItems(dom, node, format, 'styles', similar, vars)) {
        // Match classes
        if ((classes = format.classes)) {
          for (x = 0; x < classes.length; x++) {
            if (!ed.dom.hasClass(node, classes[x])) {
              return;
            }
          }
        }

        return format;
      }
    }
  }
};

const match = function (editor, name, vars, node) {
  let startNode;

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
  startNode = editor.selection.getStart();
  if (startNode !== node) {
    if (matchParents(editor, startNode, name, vars)) {
      return true;
    }
  }

  return false;
};

const matchAll = function (editor, names, vars) {
  let startElement;
  const matchedFormatNames = [];
  const checkedMap = {};

  // Check start of selection for formats
  startElement = editor.selection.getStart();
  editor.dom.getParent(startElement, function (node) {
    let i, name;

    for (i = 0; i < names.length; i++) {
      name = names[i];

      if (!checkedMap[name] && matchNode(editor, node, name, vars)) {
        checkedMap[name] = true;
        matchedFormatNames.push(name);
      }
    }
  }, editor.dom.getRoot());

  return matchedFormatNames;
};

const canApply = function (editor, name) {
  const formatList = editor.formatter.get(name);
  let startNode, parents, i, x, selector;
  const dom = editor.dom;

  if (formatList) {
    startNode = editor.selection.getStart();
    parents = FormatUtils.getParents(dom, startNode);

    for (x = formatList.length - 1; x >= 0; x--) {
      selector = formatList[x].selector;

      // Format is not selector based then always return TRUE
      // Is it has a defaultBlock then it's likely it can be applied for example align on a non block element line
      if (!selector || formatList[x].defaultBlock) {
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

export default {
  matchNode,
  matchName,
  match,
  matchAll,
  canApply,
  matchesUnInheritedFormatSelector
};