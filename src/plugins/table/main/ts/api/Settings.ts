/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import { Type, Option } from '@ephox/katamari';

export interface StringMap {
  [key: string]: string;
}

type ClassList = Array<{title: string, value: string}>;
type ColorPickerCallback = (editor: Editor, pickValue: (value: string) => void, value: string) => void;

const defaultTableToolbar = [
  'tableprops', 'tabledelete', '|', 'tableinsertrowbefore',
  'tableinsertrowafter', 'tabledeleterow', '|', 'tableinsertcolbefore',
  'tableinsertcolafter', 'tabledeletecol'
];

const defaultStyles = {
  'border-collapse': 'collapse',
  'width': '100%'
};

const defaultAttributes = {
  border: '1'
};

const getDefaultAttributes = (editor: Editor): StringMap => editor.getParam('table_default_attributes', defaultAttributes, 'object');
const getDefaultStyles = (editor: Editor): StringMap => editor.getParam('table_default_styles', defaultStyles, 'object');
const hasTableResizeBars = (editor: Editor): boolean => editor.getParam('table_resize_bars', true, 'boolean');
const hasTabNavigation = (editor: Editor): boolean => editor.getParam('table_tab_navigation', true, 'boolean');
const hasAdvancedCellTab = (editor: Editor): boolean => editor.getParam('table_cell_advtab', true, 'boolean');
const hasAdvancedRowTab = (editor: Editor): boolean => editor.getParam('table_row_advtab', true, 'boolean');
const hasAdvancedTableTab = (editor: Editor): boolean => editor.getParam('table_advtab', true, 'boolean');
const hasAppearanceOptions = (editor: Editor): boolean => editor.getParam('table_appearance_options', true, 'boolean');
const hasTableGrid = (editor: Editor): boolean => editor.getParam('table_grid', true, 'boolean');
const shouldStyleWithCss = (editor: Editor): boolean => editor.getParam('table_style_by_css', false, 'boolean');
const getCellClassList = (editor: Editor): ClassList => editor.getParam('table_cell_class_list', [], 'array');
const getRowClassList = (editor: Editor): ClassList => editor.getParam('table_row_class_list', [], 'array');
const getTableClassList = (editor: Editor): ClassList => editor.getParam('table_class_list', [], 'array');
const getColorPickerCallback = (editor: Editor): ColorPickerCallback => editor.getParam('color_picker_callback');
const isPercentagesForced = (editor: Editor): boolean => editor.getParam('table_responsive_width') === true;
const isPixelsForced = (editor: Editor): boolean => editor.getParam('table_responsive_width') === false;

const getCloneElements = (editor: Editor): Option<string[]> => {
  const cloneElements = editor.getParam('table_clone_elements');

  if (Type.isString(cloneElements)) {
    return Option.some(cloneElements.split(/[ ,]/));
  } else if (Array.isArray(cloneElements)) {
    return Option.some(cloneElements);
  } else {
    return Option.none();
  }
};

const hasObjectResizing = (editor: Editor): boolean => {
  const objectResizing = editor.getParam('object_resizing', true);
  return objectResizing === 'table' || objectResizing;
};

const getToolbar = (editor: Editor): string[] => {
  const toolbar = editor.getParam('table_toolbar', defaultTableToolbar);

  if (toolbar === '' || toolbar === false) {
    return [];
  } else if (Type.isString(toolbar)) {
    return toolbar.split(/[ ,]/);
  } else if (Type.isArray(toolbar)) {
    return toolbar;
  } else {
    return [];
  }
};

export {
  getDefaultAttributes,
  getDefaultStyles,
  hasTableResizeBars,
  hasTabNavigation,
  hasAdvancedCellTab,
  hasAdvancedRowTab,
  hasAdvancedTableTab,
  hasAppearanceOptions,
  hasTableGrid,
  shouldStyleWithCss,
  getCellClassList,
  getRowClassList,
  getTableClassList,
  getColorPickerCallback,
  getCloneElements,
  hasObjectResizing,
  isPercentagesForced,
  isPixelsForced,
  getToolbar
};
