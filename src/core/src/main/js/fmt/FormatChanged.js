/**
 * FormatChanged.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.FormatChanged',
  [
    'ephox.katamari.api.Cell',
    'tinymce.core.fmt.FormatUtils',
    'tinymce.core.fmt.MatchFormat',
    'tinymce.core.util.Tools'
  ],
  function (Cell, FormatUtils, MatchFormat, Tools) {
    var each = Tools.each;

    var setup = function (formatChangeData, editor) {
      var currentFormats = {};

      formatChangeData.set({});

      editor.on('NodeChange', function (e) {
        var parents = FormatUtils.getParents(editor.dom, e.element), matchedFormats = {};

        // Ignore bogus nodes like the <a> tag created by moveStart()
        parents = Tools.grep(parents, function (node) {
          return node.nodeType === 1 && !node.getAttribute('data-mce-bogus');
        });

        // Check for new formats
        each(formatChangeData.get(), function (callbacks, format) {
          each(parents, function (node) {
            if (editor.formatter.matchNode(node, format, {}, callbacks.similar)) {
              if (!currentFormats[format]) {
                // Execute callbacks
                each(callbacks, function (callback) {
                  callback(true, { node: node, format: format, parents: parents });
                });

                currentFormats[format] = callbacks;
              }

              matchedFormats[format] = callbacks;
              return false;
            }

            if (MatchFormat.matchesUnInheritedFormatSelector(editor, node, format)) {
              return false;
            }
          });
        });

        // Check if current formats still match
        each(currentFormats, function (callbacks, format) {
          if (!matchedFormats[format]) {
            delete currentFormats[format];

            each(callbacks, function (callback) {
              callback(false, { node: e.element, format: format, parents: parents });
            });
          }
        });
      });
    };

    var addListeners = function (formatChangeData, formats, callback, similar) {
      var formatChangeItems = formatChangeData.get();

      each(formats.split(','), function (format) {
        if (!formatChangeItems[format]) {
          formatChangeItems[format] = [];
          formatChangeItems[format].similar = similar;
        }

        formatChangeItems[format].push(callback);
      });

      formatChangeData.set(formatChangeItems);
    };

    var formatChanged = function (editor, formatChangeState, formats, callback, similar) {
      if (formatChangeState.get() === null) {
        setup(formatChangeState, editor);
      }

      addListeners(formatChangeState, formats, callback, similar);
    };

    return {
      formatChanged: formatChanged
    };
  }
);