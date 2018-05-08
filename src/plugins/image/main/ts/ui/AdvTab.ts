import Settings from '../api/Settings';
import Utils from '../core/Utils';
import { Editor } from 'tinymce/core/api/Editor';
import { normalizeCss } from 'tinymce/plugins/image/core/ImageSelection';
import { defaultData, getStyleValue } from 'tinymce/plugins/image/core/ImageData';
import { Merger } from '@ephox/katamari';

const updateVSpaceHSpaceBorder = function (editor) {
  return function (evt) {
    const dom = editor.dom;
    const rootControl = evt.control.rootControl;

    if (!Settings.hasAdvTab(editor)) {
      return;
    }

    const data = rootControl.toJSON();
    let css = dom.parseStyle(data.style);

    rootControl.find('#vspace').value('');
    rootControl.find('#hspace').value('');

    css = Utils.mergeMargins(css);

    // Move opposite equal margins to vspace/hspace field
    if ((css['margin-top'] && css['margin-bottom']) || (css['margin-right'] && css['margin-left'])) {
      if (css['margin-top'] === css['margin-bottom']) {
        rootControl.find('#vspace').value(Utils.removePixelSuffix(css['margin-top']));
      } else {
        rootControl.find('#vspace').value('');
      }
      if (css['margin-right'] === css['margin-left']) {
        rootControl.find('#hspace').value(Utils.removePixelSuffix(css['margin-right']));
      } else {
        rootControl.find('#hspace').value('');
      }
    }

    // Move border-width
    if (css['border-width']) {
      rootControl.find('#border').value(Utils.removePixelSuffix(css['border-width']));
    } else {
      rootControl.find('#border').value('');
    }

    // Move border-style
    if (css['border-style']) {
      rootControl.find('#borderStyle').value(css['border-style']);
    } else {
      rootControl.find('#borderStyle').value('');
    }

    rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
  };
};

const updateStyle = (editor: Editor, win) => {
  win.find('#style').each((ctrl) => {
    const value = getStyleValue((css) => normalizeCss(editor, css), Merger.merge(defaultData(), win.toJSON()));
    ctrl.value(value);
  });
};

const makeTab = function (editor) {
  return {
    title: 'Advanced',
    type: 'form',
    pack: 'start',
    items: [
      {
        label: 'Style',
        name: 'style',
        type: 'textbox',
        onchange: updateVSpaceHSpaceBorder(editor)
      },
      {
        type: 'form',
        layout: 'grid',
        packV: 'start',
        columns: 2,
        padding: 0,
        defaults: {
          type: 'textbox',
          maxWidth: 50,
          onchange (evt) {
            updateStyle(editor, evt.control.rootControl);
          }
        },
        items: [
          { label: 'Vertical space', name: 'vspace' },
          { label: 'Border width', name: 'border' },
          { label: 'Horizontal space', name: 'hspace' },
          {
            label: 'Border style',
            type: 'listbox',
            name: 'borderStyle',
            width: 90,
            maxWidth: 90,
            onselect (evt) {
              updateStyle(editor, evt.control.rootControl);
            },
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
          }
        ]
      }
    ]
  };
};

export default {
  makeTab
};