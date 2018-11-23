/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Color from 'tinymce/core/api/util/Color';

const showPreview = function (win, hexColor) {
  win.find('#preview')[0].getEl().style.background = hexColor;
};

const setColor = function (win, value) {
  const color = Color(value), rgb = color.toRgb();

  win.fromJSON({
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    hex: color.toHex().substr(1)
  });

  showPreview(win, color.toHex());
};

const open = function (editor, callback, value) {
  const win = editor.windowManager.open({
    title: 'Color',
    items: {
      type: 'container',
      layout: 'flex',
      direction: 'row',
      align: 'stretch',
      padding: 5,
      spacing: 10,
      items: [
        {
          type: 'colorpicker',
          value,
          onchange () {
            const rgb = this.rgb();

            if (win) {
              win.find('#r').value(rgb.r);
              win.find('#g').value(rgb.g);
              win.find('#b').value(rgb.b);
              win.find('#hex').value(this.value().substr(1));
              showPreview(win, this.value());
            }
          }
        },
        {
          type: 'form',
          padding: 0,
          labelGap: 5,
          defaults: {
            type: 'textbox',
            size: 7,
            value: '0',
            flex: 1,
            spellcheck: false,
            onchange () {
              const colorPickerCtrl = win.find('colorpicker')[0];
              let name, value;

              name = this.name();
              value = this.value();

              if (name === 'hex') {
                value = '#' + value;
                setColor(win, value);
                colorPickerCtrl.value(value);
                return;
              }

              value = {
                r: win.find('#r').value(),
                g: win.find('#g').value(),
                b: win.find('#b').value()
              };

              colorPickerCtrl.value(value);
              setColor(win, value);
            }
          },
          items: [
            { name: 'r', label: 'R', autofocus: 1 },
            { name: 'g', label: 'G' },
            { name: 'b', label: 'B' },
            { name: 'hex', label: '#', value: '000000' },
            { name: 'preview', type: 'container', border: 1 }
          ]
        }
      ]
    },
    onSubmit () {
      callback('#' + win.toJSON().hex);
    }
  });

  setColor(win, value);
};

export default {
  open
};