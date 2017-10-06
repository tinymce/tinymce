/**
 * Formatter.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.textpattern.core.Formatter',
  [
    'global!document',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.util.Tools',
    'tinymce.plugins.textpattern.core.Patterns'
  ],
  function (document, TreeWalker, Tools, Patterns) {
    var splitContainer = function (container, pattern, endOffset, startOffset, space) {

      // Split text node and remove start/end from text node
      container = startOffset > 0 ? container.splitText(startOffset) : container;
      container.splitText(endOffset - startOffset + pattern.end.length);
      container.deleteData(0, pattern.start.length);
      container.deleteData(container.data.length - pattern.end.length, pattern.end.length);

      return container;
    };

    var patternFromRng = function (patterns, rng, space) {
      if (rng.collapsed === false) {
        return;
      }

      var container = rng.startContainer;
      var text = container.data;
      var delta = space === true ? 1 : 0;

      if (container.nodeType !== 3) {
        return;
      }

      // Find best matching end
      var endPattern = Patterns.findEndPattern(patterns, text, rng.startOffset, delta);
      if (endPattern === undefined) {
        return;
      }

      // Find start of matched pattern
      var endOffset = text.lastIndexOf(endPattern.end, rng.startOffset - delta);
      var startOffset = text.lastIndexOf(endPattern.start, endOffset - endPattern.end.length);
      endOffset = text.indexOf(endPattern.end, startOffset + endPattern.start.length);

      if (startOffset === -1) {
        return;
      }

      // Setup a range for the matching word
      var patternRng = document.createRange();
      patternRng.setStart(container, startOffset);
      patternRng.setEnd(container, endOffset + endPattern.end.length);

      var startPattern = Patterns.findPattern(patterns, patternRng.toString());

      if (endPattern === undefined || startPattern !== endPattern || (container.data.length <= endPattern.start.length + endPattern.end.length)) {
        return;
      }

      return {
        pattern: endPattern,
        startOffset: startOffset,
        endOffset: endOffset
      };
    };

    var splitAndApply = function (editor, container, found, space) {
      var formatArray = Tools.isArray(found.pattern.format) ? found.pattern.format : [found.pattern.format];
      var validFormats = Tools.grep(formatArray, function (formatName) {
        var format = editor.formatter.get(formatName);
        return format && format[0].inline;
      });

      if (validFormats.length !== 0) {
        editor.undoManager.transact(function () {
          container = splitContainer(container, found.pattern, found.endOffset, found.startOffset, space);
          formatArray.forEach(function (format) {
            editor.formatter.apply(format, {}, container);
          });
        });

        return container;
      }
    };

    // Handles inline formats like *abc* and **abc**
    var doApplyInlineFormat = function (editor, patterns, space) {
      var rng = editor.selection.getRng(true);
      var foundPattern = patternFromRng(patterns, rng, space);

      if (foundPattern) {
        return splitAndApply(editor, rng.startContainer, foundPattern, space);
      }
    };

    var applyInlineFormatSpace = function (editor, patterns) {
      return doApplyInlineFormat(editor, patterns, true);
    };
    var applyInlineFormatEnter = function (editor, patterns) {
      return doApplyInlineFormat(editor, patterns, false);
    };

    // Handles block formats like ##abc or 1. abc
    var applyBlockFormat = function (editor, patterns) {
      var selection, dom, container, firstTextNode, node, format, textBlockElm, pattern, walker, rng, offset;

      selection = editor.selection;
      dom = editor.dom;

      if (!selection.isCollapsed()) {
        return;
      }

      textBlockElm = dom.getParent(selection.getStart(), 'p');
      if (textBlockElm) {
        walker = new TreeWalker(textBlockElm, textBlockElm);
        while ((node = walker.next())) {
          if (node.nodeType === 3) {
            firstTextNode = node;
            break;
          }
        }

        if (firstTextNode) {
          pattern = Patterns.findPattern(patterns, firstTextNode.data);
          if (!pattern) {
            return;
          }

          rng = selection.getRng(true);
          container = rng.startContainer;
          offset = rng.startOffset;

          if (firstTextNode === container) {
            offset = Math.max(0, offset - pattern.start.length);
          }

          if (Tools.trim(firstTextNode.data).length === pattern.start.length) {
            return;
          }

          if (pattern.format) {
            format = editor.formatter.get(pattern.format);
            if (format && format[0].block) {
              firstTextNode.deleteData(0, pattern.start.length);
              editor.formatter.apply(pattern.format, {}, firstTextNode);

              rng.setStart(container, offset);
              rng.collapse(true);
              selection.setRng(rng);
            }
          }

          if (pattern.cmd) {
            editor.undoManager.transact(function () {
              firstTextNode.deleteData(0, pattern.start.length);
              editor.execCommand(pattern.cmd);
            });
          }
        }
      }
    };

    return {
      patternFromRng: patternFromRng,
      applyInlineFormatSpace: applyInlineFormatSpace,
      applyInlineFormatEnter: applyInlineFormatEnter,
      applyBlockFormat: applyBlockFormat
    };
  }
);
