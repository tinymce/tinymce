/**
 * Helpers.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import * as Util from '../alien/Util';
import { getColorPickerCallback } from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';
import { Node, document } from '@ephox/dom-globals';

/**
 * @class tinymce.table.ui.Helpers
 * @private
 */

const buildListItems = function (inputList, itemCallback, startItems?) {
  const appendItems = function (values, output?) {
    output = output || [];

    Tools.each(values, function (item) {
      const menuItem: any = { text: item.text || item.title };

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

function styleFieldHasFocus(e) {
  return e.control.rootControl.find('#style')[0].getEl().isEqualNode(document.activeElement);
}

const syncAdvancedStyleFields = function (editor: Editor, evt) {
  if (styleFieldHasFocus(evt)) {
    updateAdvancedFields(editor, evt);
  } else {
    updateStyleField(editor, evt);
  }
};

const updateStyleField = function (editor: Editor, evt) {
  const dom = editor.dom;
  const rootControl = evt.control.rootControl;
  const data = rootControl.toJSON();
  const css = dom.parseStyle(data.style);

  css['border-style'] = data.borderStyle;
  css['border-color'] = data.borderColor;
  css['background-color'] = data.backgroundColor;
  css.width = data.width ? Util.addSizeSuffix(data.width) : '';
  css.height = data.height ? Util.addSizeSuffix(data.height) : '';

  rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
};

const updateAdvancedFields = function (editor: Editor, evt) {
  const dom = editor.dom;
  const rootControl = evt.control.rootControl;
  const data = rootControl.toJSON();
  const css = dom.parseStyle(data.style);

  rootControl.find('#borderStyle').value(css['border-style'] || '');
  rootControl.find('#borderColor').value(css['border-color'] || '');
  rootControl.find('#backgroundColor').value(css['background-color'] || '');
  rootControl.find('#width').value(css.width || '');
  rootControl.find('#height').value(css.height || '');
};

const extractAdvancedStyles = function (dom: DOMUtils, elm): Node {
  const css = dom.parseStyle(dom.getAttrib(elm, 'style'));
  const data: any = {};

  if (css['border-style']) {
    data.borderStyle = css['border-style'];
  }

  if (css['border-color']) {
    data.borderColor = css['border-color'];
  }

  if (css['background-color']) {
    data.backgroundColor = css['background-color'];
  }

  data.style = dom.serializeStyle(css);
  return data;
};

const createStyleForm = function (editor: Editor) {
  const createColorPickAction = function () {
    const colorPickerCallback = getColorPickerCallback(editor);
    if (colorPickerCallback) {
      return function (evt) {
        return colorPickerCallback.call(
          editor,
          function (value) {
            evt.control.value(value).fire('change');
          },
          evt.control.value()
        );
      };
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
        type: 'textbox',
        onchange: Fun.curry(updateAdvancedFields, editor)
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
            onaction: createColorPickAction()
          },
          {
            label: 'Background color',
            type: 'colorbox',
            name: 'backgroundColor',
            onaction: createColorPickAction()
          }
        ]
      }
    ]
  };
};

export default {
  createStyleForm,
  buildListItems,
  updateStyleField,
  extractAdvancedStyles,
  updateAdvancedFields,
  syncAdvancedStyleFields
};