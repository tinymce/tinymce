/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Option, Type } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

export interface StringMap {
  [key: string]: string;
}

type ClassList = Array<{title: string; value: string}>;
type TableSizingMode = 'fixed' | 'relative' | 'responsive' | 'auto';

const defaultTableToolbar = 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol';

const defaultStyles = {
  'border-collapse': 'collapse',
  'width': '100%'
};

const determineDefaultStyles = (editor: Editor) => {
  if (isPixelsForced(editor)) {
    const editorWidth = editor.getBody().offsetWidth;
    return { ...defaultStyles, width: editorWidth + 'px' };
  } else if (isResponsiveForced(editor)) {
    return Obj.filter(defaultStyles, (_value, key) => key !== 'width');
  } else {
    return defaultStyles;
  }
};

const defaultAttributes = {
  border: '1'
};

const getTableSizingMode = (editor: Editor): TableSizingMode => editor.getParam('table_sizing_mode', 'auto');
const getTableResponseWidth = (editor: Editor): boolean | undefined => editor.getParam('table_responsive_width');

const getDefaultAttributes = (editor: Editor): StringMap => editor.getParam('table_default_attributes', defaultAttributes, 'object');
const getDefaultStyles = (editor: Editor): StringMap => editor.getParam('table_default_styles', determineDefaultStyles(editor), 'object');
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
const isPercentagesForced = (editor: Editor): boolean => getTableSizingMode(editor) === 'relative' || getTableResponseWidth(editor) === true;
const isPixelsForced = (editor: Editor): boolean => getTableSizingMode(editor) === 'fixed' || getTableResponseWidth(editor) === false;
const isResponsiveForced = (editor: Editor): boolean => getTableSizingMode(editor) === 'responsive';
const getToolbar = (editor: Editor): string => editor.getParam('table_toolbar', defaultTableToolbar);


const getTableHeaderType = (editor: Editor): string => {
  const defaultValue = 'section';
  const value = editor.getParam('table_header_type', defaultValue, 'string');
  const validValues = [ 'section', 'cells', 'sectionCells', 'auto' ];
  if (!Arr.contains(validValues, value)) {
    return defaultValue;
  } else {
    return value;
  }
};

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
  return Type.isString(objectResizing) ? objectResizing === 'table' : objectResizing;
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
  getCloneElements,
  hasObjectResizing,
  isPercentagesForced,
  isPixelsForced,
  isResponsiveForced,
  getToolbar,
  getTableHeaderType
};
