/**
 * FormatSelect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.FormatSelect',
  [
    'tinymce.core.util.Tools',
    'tinymce.ui.editorui.FormatUtils'
  ],
  function (Tools, FormatUtils) {
    var defaultBlocks = (
      'Paragraph=p;' +
      'Heading 1=h1;' +
      'Heading 2=h2;' +
      'Heading 3=h3;' +
      'Heading 4=h4;' +
      'Heading 5=h5;' +
      'Heading 6=h6;' +
      'Preformatted=pre'
    );

    var createFormats = function (formats) {
      formats = formats.replace(/;$/, '').split(';');

      var i = formats.length;
      while (i--) {
        formats[i] = formats[i].split('=');
      }

      return formats;
    };

    var createListBoxChangeHandler = function (editor, items, formatName) {
      return function () {
        var self = this;

        editor.on('nodeChange', function (e) {
          var formatter = editor.formatter;
          var value = null;

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

    var lazyFormatSelectBoxItems = function (editor, blocks) {
      return function () {
        var items = [];

        Tools.each(blocks, function (block) {
          items.push({
            text: block[0],
            value: block[1],
            textStyle: function () {
              return editor.formatter.getCssText(block[1]);
            }
          });
        });

        return {
          type: 'listbox',
          text: blocks[0][0],
          values: items,
          fixedWidth: true,
          onselect: function (e) {
            if (e.control) {
              var fmt = e.control.value();
              FormatUtils.toggleFormat(editor, fmt)();
            }
          },
          onPostRender: createListBoxChangeHandler(editor, items)
        };
      };
    };

    var buildMenuItems = function (editor, blocks) {
      return Tools.map(blocks, function (block) {
        return {
          text: block[0],
          onclick: FormatUtils.toggleFormat(editor, block[1]),
          textStyle: function () {
            return editor.formatter.getCssText(block[1]);
          }
        };
      });
    };

    var register = function (editor) {
      var blocks = createFormats(editor.settings.block_formats || defaultBlocks);

      editor.addMenuItem('blockformats', {
        text: 'Blocks',
        menu: buildMenuItems(editor, blocks)
      });

      editor.addButton('formatselect', lazyFormatSelectBoxItems(editor, blocks));
    };

    return {
      register: register
    };
  }
);

