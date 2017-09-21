/**
 * MatchFormat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.MatchFormat',
  [
    'tinymce.core.fmt.FormatUtils'
  ],
  function (FormatUtils) {
    var isEq = FormatUtils.isEq;

    var matchesUnInheritedFormatSelector = function (ed, node, name) {
      var formatList = ed.formatter.get(name);

      if (formatList) {
        for (var i = 0; i < formatList.length; i++) {
          if (formatList[i].inherit === false && ed.dom.is(node, formatList[i].selector)) {
            return true;
          }
        }
      }

      return false;
    };

    var matchParents = function (editor, node, name, vars) {
      var root = editor.dom.getRoot();

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

    var matchName = function (dom, node, format) {
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

    var matchItems = function (dom, node, format, itemName, similar, vars) {
      var key, value, items = format[itemName], i;

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

    var matchNode = function (ed, node, name, vars, similar) {
      var formatList = ed.formatter.get(name), format, i, x, classes, dom = ed.dom;

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

    var match = function (editor, name, vars, node) {
      var startNode;

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

    var matchAll = function (editor, names, vars) {
      var startElement, matchedFormatNames = [], checkedMap = {};

      // Check start of selection for formats
      startElement = editor.selection.getStart();
      editor.dom.getParent(startElement, function (node) {
        var i, name;

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

    var canApply = function (editor, name) {
      var formatList = editor.formatter.get(name), startNode, parents, i, x, selector, dom = editor.dom;

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

    return {
      matchNode: matchNode,
      matchName: matchName,
      match: match,
      matchAll: matchAll,
      canApply: canApply,
      matchesUnInheritedFormatSelector: matchesUnInheritedFormatSelector
    };
  }
);