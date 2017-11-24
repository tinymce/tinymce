/**
 * Helpers.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.table.ui.Helpers
 * @private
 */
define(
  'tinymce.plugins.table.ui.Helpers',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.util.Tools',
    'tinymce.plugins.table.alien.Util'
  ],
  function (Fun, Tools, Util) {

    var buildListItems = function (inputList, itemCallback, startItems) {
      var appendItems = function (values, output) {
        output = output || [];

        Tools.each(values, function (item) {
          var menuItem = { text: item.text || item.title };

          if (item.menu) {
            menuItem.menu = appendItems(item.menu);
          } else {
            menuItem.value = item.value;

            if (itemCallback) {
              itemCallback(menuItem);
            }
          }

          output.push(menuItem);
        });

        return output;
      };

      return appendItems(inputList, startItems || []);
    };

    var updateStyleField = function (editor, evt) {
      var dom = editor.dom;
      var rootControl = evt.control.rootControl;
      var data = rootControl.toJSON();
      var css = dom.parseStyle(data.style);

      if (evt.control.name() === 'style') {
        rootControl.find('#borderStyle').value(css["border-style"] || '')[0].fire('select');
        rootControl.find('#borderColor').value(css["border-color"] || '')[0].fire('change');
        rootControl.find('#backgroundColor').value(css["background-color"] || '')[0].fire('change');
        rootControl.find('#width').value(css.width || '').fire('change');
        rootControl.find('#height').value(css.height || '').fire('change');
      } else {
        css["border-style"] = data.borderStyle;
        css["border-color"] = data.borderColor;
        css["background-color"] = data.backgroundColor;
        css.width = data.width ? Util.addSizeSuffix(data.width) : '';
        css.height = data.height ? Util.addSizeSuffix(data.height) : '';
      }

      rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
    };

    var extractAdvancedStyles = function (dom, elm) {
      var css = dom.parseStyle(dom.getAttrib(elm, 'style'));
      var data = {};

      if (css["border-style"]) {
        data.borderStyle = css["border-style"];
      }

      if (css["border-color"]) {
        data.borderColor = css["border-color"];
      }

      if (css["background-color"]) {
        data.backgroundColor = css["background-color"];
      }

      data.style = dom.serializeStyle(css);
      return data;
    };

    var createStyleForm = function (editor) {
      var createColorPickAction = function (evt) {
        var colorPickerCallback = editor.settings.color_picker_callback;
        if (colorPickerCallback) {
          return colorPickerCallback.call(
            editor,
            function (value) {
              evt.control.value(value).fire('change');
            },
            evt.control.value()
          );
        }
      };

      return {
        title: 'Advanced',
        type: 'form',
        defaults: {
          onchange: Fun.curry(updateStyleField, editor)
        },
        items: [
          {
            label: 'Style',
            name: 'style',
            type: 'textbox'
          },

          {
            type: 'form',
            padding: 0,
            formItemDefaults: {
              layout: 'grid',
              alignH: ['start', 'right']
            },
            defaults: {
              size: 7
            },
            items: [
              {
                label: 'Border style',
                type: 'listbox',
                name: 'borderStyle',
                width: 90,
                onselect: Fun.curry(updateStyleField, editor),
                values: [
                  { text: 'Select...', value: '' },
                  { text: 'Solid', value: 'solid' },
                  { text: 'Dotted', value: 'dotted' },
                  { text: 'Dashed', value: 'dashed' },
                  { text: 'Double', value: 'double' },
                  { text: 'Groove', value: 'groove' },
                  { text: 'Ridge', value: 'ridge' },
                  { text: 'Inset', value: 'inset' },
                  { text: 'Outset', value: 'outset' },
                  { text: 'None', value: 'none' },
                  { text: 'Hidden', value: 'hidden' }
                ]
              },
              {
                label: 'Border color',
                type: 'colorbox',
                name: 'borderColor',
                onaction: createColorPickAction
              },
              {
                label: 'Background color',
                type: 'colorbox',
                name: 'backgroundColor',
                onaction: createColorPickAction
              }
            ]
          }
        ]
      };
    };

    return {
      createStyleForm: createStyleForm,
      buildListItems: buildListItems,
      updateStyleField: updateStyleField,
      extractAdvancedStyles: extractAdvancedStyles
    };
  }
);
