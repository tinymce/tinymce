/**
 * FormatUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.FormatUtils',
  [
    'tinymce.core.dom.TreeWalker'
  ],
  function (TreeWalker) {
    var isInlineBlock = function (node) {
      return node && /^(IMG)$/.test(node.nodeName);
    };

    var moveStart = function (dom, selection, rng) {
      var container = rng.startContainer,
        offset = rng.startOffset,
        walker, node, nodes;

      if (rng.startContainer === rng.endContainer) {
        if (isInlineBlock(rng.startContainer.childNodes[rng.startOffset])) {
          return;
        }
      }

      // Convert text node into index if possible
      if (container.nodeType === 3 && offset >= container.nodeValue.length) {
        // Get the parent container location and walk from there
        offset = dom.nodeIndex(container);
        container = container.parentNode;
      }

      // Move startContainer/startOffset in to a suitable node
      if (container.nodeType === 1) {
        nodes = container.childNodes;
        if (offset < nodes.length) {
          container = nodes[offset];
          walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));
        } else {
          container = nodes[nodes.length - 1];
          walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));
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
    var getNonWhiteSpaceSibling = function (node, next, inc) {
      if (node) {
        next = next ? 'nextSibling' : 'previousSibling';

        for (node = inc ? node : node[next]; node; node = node[next]) {
          if (node.nodeType === 1 || !isWhiteSpaceNode(node)) {
            return node;
          }
        }
      }
    };

    var isTextBlock = function (editor, name) {
      if (name.nodeType) {
        name = name.nodeName;
      }

      return !!editor.schema.getTextBlockElements()[name.toLowerCase()];
    };

    var isValid = function (ed, parent, child) {
      return ed.schema.isValidChild(parent, child);
    };

    var isWhiteSpaceNode = function (node) {
      return node && node.nodeType === 3 && /^([\t \r\n]+|)$/.test(node.nodeValue);
    };

    /**
     * Replaces variables in the value. The variable format is %var.
     *
     * @private
     * @param {String} value Value to replace variables in.
     * @param {Object} vars Name/value array with variables to replace.
     * @return {String} New value with replaced variables.
     */
    var replaceVars = function (value, vars) {
      if (typeof value !== "string") {
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
    var isEq = function (str1, str2) {
      str1 = str1 || '';
      str2 = str2 || '';

      str1 = '' + (str1.nodeName || str1);
      str2 = '' + (str2.nodeName || str2);

      return str1.toLowerCase() === str2.toLowerCase();
    };

    var normalizeStyleValue = function (dom, value, name) {
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

    var getStyle = function (dom, node, name) {
      return normalizeStyleValue(dom, dom.getStyle(node, name), name);
    };

    var getTextDecoration = function (dom, node) {
      var decoration;

      dom.getParent(node, function (n) {
        decoration = dom.getStyle(n, 'text-decoration');
        return decoration && decoration !== 'none';
      });

      return decoration;
    };

    var getParents = function (dom, node, selector) {
      return dom.getParents(node, selector, dom.getRoot());
    };

    return {
      isInlineBlock: isInlineBlock,
      moveStart: moveStart,
      getNonWhiteSpaceSibling: getNonWhiteSpaceSibling,
      isTextBlock: isTextBlock,
      isValid: isValid,
      isWhiteSpaceNode: isWhiteSpaceNode,
      replaceVars: replaceVars,
      isEq: isEq,
      normalizeStyleValue: normalizeStyleValue,
      getStyle: getStyle,
      getTextDecoration: getTextDecoration,
      getParents: getParents
    };
  }
);