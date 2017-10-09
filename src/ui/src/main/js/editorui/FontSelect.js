/**
 * FontSelect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.FontSelect',
  [
    'tinymce.core.util.Tools',
    'tinymce.ui.fmt.FontInfo'
  ],
  function (Tools, FontInfo) {
    var getFirstFont = function (fontFamily) {
      return fontFamily ? fontFamily.split(',')[0] : '';
    };

    var findMatchingValue = function (items, fontFamily) {
      var value;

      Tools.each(items, function (item) {
        if (item.value.toLowerCase() === fontFamily.toLowerCase()) {
          value = item.value;
        }
      });

      Tools.each(items, function (item) {
        if (!value && getFirstFont(item.value).toLowerCase() === getFirstFont(fontFamily).toLowerCase()) {
          value = item.value;
        }
      });

      return value;
    };

    var createFontNameListBoxChangeHandler = function (editor, items) {
      return function () {
        var self = this;

        editor.on('init nodeChange', function (e) {
          var fontFamily = FontInfo.getFontFamily(editor.getBody(), e.element);
          var match = findMatchingValue(items, fontFamily);

          self.value(match ? match : null);

          if (!match && fontFamily) {
            self.text(getFirstFont(fontFamily));
          }
        });
      };
    };

    var createFormats = function (formats) {
      formats = formats.replace(/;$/, '').split(';');

      var i = formats.length;
      while (i--) {
        formats[i] = formats[i].split('=');
      }

      return formats;
    };

    var getFontItems = function (editor) {
      var defaultFontsFormats = (
        'Andale Mono=andale mono,monospace;' +
        'Arial=arial,helvetica,sans-serif;' +
        'Arial Black=arial black,sans-serif;' +
        'Book Antiqua=book antiqua,palatino,serif;' +
        'Comic Sans MS=comic sans ms,sans-serif;' +
        'Courier New=courier new,courier,monospace;' +
        'Georgia=georgia,palatino,serif;' +
        'Helvetica=helvetica,arial,sans-serif;' +
        'Impact=impact,sans-serif;' +
        'Symbol=symbol;' +
        'Tahoma=tahoma,arial,helvetica,sans-serif;' +
        'Terminal=terminal,monaco,monospace;' +
        'Times New Roman=times new roman,times,serif;' +
        'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
        'Verdana=verdana,geneva,sans-serif;' +
        'Webdings=webdings;' +
        'Wingdings=wingdings,zapf dingbats'
      );

      var fonts = createFormats(editor.settings.font_formats || defaultFontsFormats);

      return Tools.map(fonts, function (font) {
        return {
          text: { raw: font[0] },
          value: font[1],
          textStyle: font[1].indexOf('dings') === -1 ? 'font-family:' + font[1] : ''
        };
      });
    };

    var registerButtons = function (editor) {
      editor.addButton('fontselect', function () {
        var items = getFontItems(editor);

        return {
          type: 'listbox',
          text: 'Font Family',
          tooltip: 'Font Family',
          values: items,
          fixedWidth: true,
          onPostRender: createFontNameListBoxChangeHandler(editor, items),
          onselect: function (e) {
            if (e.control.settings.value) {
              editor.execCommand('FontName', false, e.control.settings.value);
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
