/**
 * FontSizeSelect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

const round = (number: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number) => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const findMatchingValue = function (items, pt, px) {
  let value;

  Tools.each(items, function (item) {
    if (item.value === px) {
      value = px;
    } else if (item.value === pt) {
      value = pt;
    }
  });

  return value;
};

const createFontSizeListBoxChangeHandler = function (editor, items) {
  return function () {
    const self = this;

    editor.on('init nodeChange', function (e) {
      let px, pt, precision, match;

      px = editor.queryCommandValue('FontSize');
      if (px) {
        // checking for three digits after decimal point, should be precise enough
        for (precision = 3; !match && precision >= 0; precision--) {
          pt = toPt(px, precision);
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

const getFontSizeItems = function (editor) {
  const defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
  const fontsizeFormats = editor.settings.fontsize_formats || defaultFontsizeFormats;

  return Tools.map(fontsizeFormats.split(' '), function (item) {
    let text = item, value = item;
    // Allow text=value font sizes.
    const values = item.split('=');
    if (values.length > 1) {
      text = values[0];
      value = values[1];
    }

    return { text, value };
  });
};

const registerButtons = function (editor) {
  editor.addButton('fontsizeselect', function () {
    const items = getFontSizeItems(editor);

    return {
      type: 'listbox',
      text: 'Font Sizes',
      tooltip: 'Font Sizes',
      values: items,
      fixedWidth: true,
      onPostRender: createFontSizeListBoxChangeHandler(editor, items),
      onclick (e) {
        if (e.control.settings.value) {
          editor.execCommand('FontSize', false, e.control.settings.value);
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