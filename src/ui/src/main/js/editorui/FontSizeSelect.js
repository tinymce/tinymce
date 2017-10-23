/**
 * FontSizeSelect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.FontSizeSelect',
  [
    'tinymce.core.util.Tools',
    'tinymce.ui.fmt.FontInfo'
  ],
  function (Tools, FontInfo) {
    var findMatchingValue = function (items, pt, px) {
      var value;

      Tools.each(items, function (item) {
        if (item.value === px) {
          value = px;
        } else if (item.value === pt) {
          value = pt;
        }
      });

      return value;
    };

    var createFontSizeListBoxChangeHandler = function (editor, items) {
      return function () {
        var self = this;

        editor.on('init nodeChange', function (e) {
          var px, pt, precision, match;

          px = FontInfo.getFontSize(editor.getBody(), e.element);
          if (px) {
            // checking for three digits after decimal point, should be precise enough
            for (precision = 3; !match && precision >= 0; precision--) {
              pt = FontInfo.toPt(px, precision);
              match = findMatchingValue(items, pt, px);
            }
          }

          self.value(match ? match : null);

          if (!match) {
            self.text(pt);
          }
        });
      };
    };

    var getFontSizeItems = function (editor) {
      var defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
      var fontsizeFormats = editor.settings.fontsize_formats || defaultFontsizeFormats;

      return Tools.map(fontsizeFormats.split(' '), function (item) {
        var text = item, value = item;
        // Allow text=value font sizes.
        var values = item.split('=');
        if (values.length > 1) {
          text = values[0];
          value = values[1];
        }

        return { text: text, value: value };
      });
    };

    var registerButtons = function (editor) {
      editor.addButton('fontsizeselect', function () {
        var items = getFontSizeItems(editor);

        return {
          type: 'listbox',
          text: 'Font Sizes',
          tooltip: 'Font Sizes',
          values: items,
          fixedWidth: true,
          onPostRender: createFontSizeListBoxChangeHandler(editor, items),
          onclick: function (e) {
            if (e.control.settings.value) {
              editor.execCommand('FontSize', false, e.control.settings.value);
            }
          }
        };
      });
    };

    var register = function (editor) {
      registerButtons(editor);
    };

    return {
      register: register
    };
  }
);
