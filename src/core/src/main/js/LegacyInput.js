/**
 * LegacyInput.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Converts legacy input to modern HTML.
 *
 * @class tinymce.LegacyInput
 * @private
 */
define(
  'tinymce.core.LegacyInput',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    var each = Tools.each, explode = Tools.explode;

    var register = function (EditorManager) {
      EditorManager.on('AddEditor', function (e) {
        var editor = e.editor;

        editor.on('preInit', function () {
          var filters, fontSizes, dom, settings = editor.settings;

          var replaceWithSpan = function (node, styles) {
            each(styles, function (value, name) {
              if (value) {
                dom.setStyle(node, name, value);
              }
            });

            dom.rename(node, 'span');
          };

          var convert = function (e) {
            dom = editor.dom;

            if (settings.convert_fonts_to_spans) {
              each(dom.select('font,u,strike', e.node), function (node) {
                filters[node.nodeName.toLowerCase()](dom, node);
              });
            }
          };

          if (settings.inline_styles) {
            fontSizes = explode(settings.font_size_legacy_values);

            filters = {
              font: function (dom, node) {
                replaceWithSpan(node, {
                  backgroundColor: node.style.backgroundColor,
                  color: node.color,
                  fontFamily: node.face,
                  fontSize: fontSizes[parseInt(node.size, 10) - 1]
                });
              },

              u: function (dom, node) {
                // HTML5 allows U element
                if (editor.settings.schema === "html4") {
                  replaceWithSpan(node, {
                    textDecoration: 'underline'
                  });
                }
              },

              strike: function (dom, node) {
                replaceWithSpan(node, {
                  textDecoration: 'line-through'
                });
              }
            };

            editor.on('PreProcess SetContent', convert);
          }
        });
      });
    };

    return {
      register: register
    };
  }
);