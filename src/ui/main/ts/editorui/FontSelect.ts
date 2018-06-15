/**
 * FontSelect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

const getFirstFont = function (fontFamily) {
  return fontFamily ? fontFamily.split(',')[0] : '';
};

const findMatchingValue = function (items, fontFamily) {
  const font = fontFamily ? fontFamily.toLowerCase() : '';
  let value;

  Tools.each(items, function (item) {
    if (item.value.toLowerCase() === font) {
      value = item.value;
    }
  });

  Tools.each(items, function (item) {
    if (!value && getFirstFont(item.value).toLowerCase() === getFirstFont(font).toLowerCase()) {
      value = item.value;
    }
  });

  return value;
};

const createFontNameListBoxChangeHandler = function (editor, items) {
  return function () {
    const self = this;

    // We need to remove the initial value since since the display text will
    // not be updated if we set it to the same initial value on post render.
    self.state.set('value', null);

    editor.on('init nodeChange', function (e) {
      const fontFamily = editor.queryCommandValue('FontName');
      const match = findMatchingValue(items, fontFamily);

      self.value(match ? match : null);

      if (!match && fontFamily) {
        self.text(getFirstFont(fontFamily));
      }
    });
  };
};

const createFormats = function (formats) {
  formats = formats.replace(/;$/, '').split(';');

  let i = formats.length;
  while (i--) {
    formats[i] = formats[i].split('=');
  }

  return formats;
};

const getFontItems = function (editor) {
  const defaultFontsFormats = (
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

  const fonts = createFormats(editor.settings.font_formats || defaultFontsFormats);

  return Tools.map(fonts, function (font) {
    return {
      text: { raw: font[0] },
      value: font[1],
      textStyle: font[1].indexOf('dings') === -1 ? 'font-family:' + font[1] : ''
    };
  });
};

const registerButtons = function (editor) {
  editor.addButton('fontselect', function () {
    const items = getFontItems(editor);

    return {
      type: 'listbox',
      text: 'Font Family',
      tooltip: 'Font Family',
      values: items,
      fixedWidth: true,
      onPostRender: createFontNameListBoxChangeHandler(editor, items),
      onselect (e) {
        if (e.control.settings.value) {
          editor.execCommand('FontName', false, e.control.settings.value);
        }
      }
    };
  });
};

const register = function (editor) {
  registerButtons(editor);
};

export default {
  register
};