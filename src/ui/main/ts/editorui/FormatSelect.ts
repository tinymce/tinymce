/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import * as FormatUtils from './FormatUtils';

const defaultBlocks = (
  'Paragraph=p;' +
  'Heading 1=h1;' +
  'Heading 2=h2;' +
  'Heading 3=h3;' +
  'Heading 4=h4;' +
  'Heading 5=h5;' +
  'Heading 6=h6;' +
  'Preformatted=pre'
);

const createFormats = function (formats) {
  formats = formats.replace(/;$/, '').split(';');

  let i = formats.length;
  while (i--) {
    formats[i] = formats[i].split('=');
  }

  return formats;
};

const createListBoxChangeHandler = function (editor, items, formatName?) {
  return function () {
    const self = this;

    editor.on('nodeChange', function (e) {
      const formatter = editor.formatter;
      let value = null;

      Tools.each(e.parents, function (node) {
        Tools.each(items, function (item) {
          if (formatName) {
            if (formatter.matchNode(node, formatName, { value: item.value })) {
              value = item.value;
            }
          } else {
            if (formatter.matchNode(node, item.value)) {
              value = item.value;
            }
          }

          if (value) {
            return false;
          }
        });

        if (value) {
          return false;
        }
      });

      self.value(value);
    });
  };
};

const lazyFormatSelectBoxItems = function (editor, blocks) {
  return function () {
    const items = [];

    Tools.each(blocks, function (block) {
      items.push({
        text: block[0],
        value: block[1],
        textStyle () {
          return editor.formatter.getCssText(block[1]);
        }
      });
    });

    return {
      type: 'listbox',
      text: blocks[0][0],
      values: items,
      fixedWidth: true,
      onselect (e) {
        if (e.control) {
          const fmt = e.control.value();
          FormatUtils.toggleFormat(editor, fmt)();
        }
      },
      onPostRender: createListBoxChangeHandler(editor, items)
    };
  };
};

const buildMenuItems = function (editor, blocks) {
  return Tools.map(blocks, function (block) {
    return {
      text: block[0],
      onclick: FormatUtils.toggleFormat(editor, block[1]),
      textStyle () {
        return editor.formatter.getCssText(block[1]);
      }
    };
  });
};

const register = function (editor) {
  const blocks = createFormats(editor.settings.block_formats || defaultBlocks);

  editor.addMenuItem('blockformats', {
    text: 'Blocks',
    menu: buildMenuItems(editor, blocks)
  });

  editor.addButton('formatselect', lazyFormatSelectBoxItems(editor, blocks));
};

export default {
  register
};