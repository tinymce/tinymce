/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import TextColor from '../core/TextColor';
import ColorPickerHtml from './ColorPickerHtml';

const setDivColor = function setDivColor(div, value) {
  div.style.background = value;
  div.setAttribute('data-mce-color', value);
};

const onButtonClick = function (editor) {
  return function (e) {
    const ctrl = e.control;

    if (ctrl._color) {
      editor.execCommand('mceApplyTextcolor', ctrl.settings.format, ctrl._color);
    } else {
      editor.execCommand('mceRemoveTextcolor', ctrl.settings.format);
    }
  };
};

const onPanelClick = function (editor, cols) {
  return function (e) {
    const buttonCtrl = this.parent();
    let value;
    const currentColor = TextColor.getCurrentColor(editor, buttonCtrl.settings.format);

    const selectColor = function (value) {
      buttonCtrl.hidePanel();
      buttonCtrl.color(value);
      editor.execCommand('mceApplyTextcolor', buttonCtrl.settings.format, value);
    };

    const resetColor = function () {
      buttonCtrl.hidePanel();
      buttonCtrl.resetColor();
      editor.execCommand('mceRemoveTextcolor', buttonCtrl.settings.format);
    };

    if (DOMUtils.DOM.getParent(e.target, '.mce-custom-color-btn')) {
      buttonCtrl.hidePanel();

      const colorPickerCallback = Settings.getColorPickerCallback(editor);

      colorPickerCallback.call(editor, function (value) {
        const tableElm = buttonCtrl.panel.getEl().getElementsByTagName('table')[0];
        let customColorCells, div, i;

        customColorCells = Tools.map(tableElm.rows[tableElm.rows.length - 1].childNodes, function (elm) {
          return elm.firstChild;
        });

        for (i = 0; i < customColorCells.length; i++) {
          div = customColorCells[i];
          if (!div.getAttribute('data-mce-color')) {
            break;
          }
        }

        // Shift colors to the right
        // TODO: Might need to be the left on RTL
        if (i === cols) {
          for (i = 0; i < cols - 1; i++) {
            setDivColor(customColorCells[i], customColorCells[i + 1].getAttribute('data-mce-color'));
          }
        }

        setDivColor(div, value);
        selectColor(value);
      }, currentColor);
    }

    value = e.target.getAttribute('data-mce-color');
    if (value) {
      if (this.lastId) {
        DOMUtils.DOM.get(this.lastId).setAttribute('aria-selected', 'false');
      }

      e.target.setAttribute('aria-selected', true);
      this.lastId = e.target.id;

      if (value === 'transparent') {
        resetColor();
      } else {
        selectColor(value);
      }
    } else if (value !== null) {
      buttonCtrl.hidePanel();
    }
  };
};

const renderColorPicker = function (editor, foreColor) {
  return function () {
    const cols = foreColor ? Settings.getForeColorCols(editor) : Settings.getBackColorCols(editor);
    const rows = foreColor ? Settings.getForeColorRows(editor) : Settings.getBackColorRows(editor);
    const colorMap = foreColor ? Settings.getForeColorMap(editor) : Settings.getBackColorMap(editor);
    const hasColorPicker = Settings.hasColorPicker(editor);

    return ColorPickerHtml.getHtml(cols, rows, colorMap, hasColorPicker);
  };
};

const register = function (editor) {
  editor.addButton('forecolor', {
    type: 'colorbutton',
    tooltip: 'Text color',
    format: 'forecolor',
    panel: {
      role: 'application',
      ariaRemember: true,
      html: renderColorPicker(editor, true),
      onclick: onPanelClick(editor, Settings.getForeColorCols(editor))
    },
    onclick: onButtonClick(editor)
  });

  editor.addButton('backcolor', {
    type: 'colorbutton',
    tooltip: 'Background color',
    format: 'hilitecolor',
    panel: {
      role: 'application',
      ariaRemember: true,
      html: renderColorPicker(editor, false),
      onclick: onPanelClick(editor, Settings.getBackColorCols(editor))
    },
    onclick: onButtonClick(editor)
  });
};

export default {
  register
};