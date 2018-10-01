import { Arr } from '@ephox/katamari';
import { Menu } from '@ephox/bridge';

/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const defaultColors = [
  { text: 'Black', value: '#1abc9c' },
  { text: 'Black', value: '#2ecc71' },
  { text: 'Black', value: '#3498db' },
  { text: 'Black', value: '#9b59b6' },
  { text: 'Black', value: '#34495e' },

  { text: 'Black', value: '#16a085' },
  { text: 'Black', value: '#27ae60' },
  { text: 'Black', value: '#2980b9' },
  { text: 'Black', value: '#8e44ad' },
  { text: 'Black', value: '#2c3e50' },

  { text: 'Black', value: '#f1c40f' },
  { text: 'Black', value: '#e67e22' },
  { text: 'Black', value: '#e74c3c' },
  { text: 'Black', value: '#ecf0f1' },
  { text: 'Black', value: '#95a5a6' },

  { text: 'Black', value: '#f39c12' },
  { text: 'Black', value: '#d35400' },
  { text: 'Black', value: '#c0392b' },
  { text: 'Black', value: '#bdc3c7' },
  { text: 'Black', value: '#7f8c8d' },

  { text: 'Black', value: '#000000' },
  { text: 'Black', value: '#ffffff' },
];

const getTextColorMap = function (editor): Menu.ChoiceMenuItemApi[]  {
  const unmapped = editor.getParam('textcolor_map', defaultColors);
  return Arr.map(unmapped, (item): Menu.ChoiceMenuItemApi => {
    return {
      text: item.text,
      value: item.value,
      type: 'choiceitem'
    };
  });
};

const getForeColorMap = function (editor) {
  return editor.getParam('forecolor_map', getTextColorMap(editor));
};

const getBackColorMap = function (editor) {
  return editor.getParam('backcolor_map', getTextColorMap(editor));
};

const getTextColorRows = function (editor) {
  return editor.getParam('textcolor_rows', 5);
};

const calcCols = (colors) => {
  return Math.ceil(Math.sqrt(colors));
};

const getTextColorCols = function (editor) {
  const colors = getTextColorMap(editor);
  const defaultCols = calcCols(colors.length);
  return editor.getParam('textcolor_cols', defaultCols);
};

const getForeColorRows = function (editor) {
  return editor.getParam('forecolor_rows', getTextColorRows(editor));
};

const getBackColorRows = function (editor) {
  return editor.getParam('backcolor_rows', getTextColorRows(editor));
};

const getForeColorCols = function (editor) {
  return editor.getParam('forecolor_cols', getTextColorCols(editor));
};

const getBackColorCols = function (editor) {
  return editor.getParam('backcolor_cols', getTextColorCols(editor));
};

const getColorPickerCallback = function (editor) {
  return editor.getParam('color_picker_callback', null);
};

const hasColorPicker = function (editor) {
  return typeof getColorPickerCallback(editor) === 'function';
};

export default {
  calcCols,
  getTextColorMap,
  getForeColorMap,
  getBackColorMap,
  getForeColorRows,
  getBackColorRows,
  getForeColorCols,
  getBackColorCols,
  getColorPickerCallback,
  hasColorPicker
};