/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional, Type } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { UserListItem, UserListValue } from '../ui/UiUtils';

export interface StringMap {
  [key: string]: string;
}

type TableSizingMode = 'fixed' | 'relative' | 'responsive' | 'auto';

const defaultTableToolbar = 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol';

const defaultStyles = {
  'border-collapse': 'collapse',
  'width': '100%'
};

const defaultCellBorderWidths = Arr.range(5, (i) => {
  const size = `${i + 1}px`;
  return { title: size, value: size };
});

const defaultCellBorderStyles = Arr.map([ 'Solid', 'Dotted', 'Dashed', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset', 'None', 'Hidden' ], (type) => {
  return { title: type, value: type.toLowerCase() };
});

const determineDefaultStyles = (editor: Editor): Record<string, string> => {
  if (isPixelsForced(editor)) {
    // Determine the inner size of the parent block element where the table will be inserted
    const dom = editor.dom;
    const parentBlock = dom.getParent<HTMLElement>(editor.selection.getStart(), dom.isBlock) ?? editor.getBody();
    const contentWidth = Width.getInner(SugarElement.fromDom(parentBlock));
    return { ...defaultStyles, width: contentWidth + 'px' };
  } else if (isResponsiveForced(editor)) {
    return Obj.filter(defaultStyles, (_value, key) => key !== 'width');
  } else {
    return defaultStyles;
  }
};

const defaultAttributes = {
  border: '1'
};

const defaultColumnResizingBehaviour = 'preservetable';

const getTableSizingMode = (editor: Editor): TableSizingMode =>
  editor.getParam('table_sizing_mode', 'auto');

const getTableResponseWidth = (editor: Editor): boolean | undefined =>
  editor.getParam('table_responsive_width');

const getTableBorderWidths = (editor: Editor): UserListItem[] =>
  editor.getParam('table_border_widths', defaultCellBorderWidths, 'array');

const getTableBorderStyles = (editor: Editor): UserListValue[] =>
  editor.getParam('table_border_styles', defaultCellBorderStyles, 'array');

const getDefaultAttributes = (editor: Editor): StringMap =>
  editor.getParam('table_default_attributes', defaultAttributes, 'object');

const getDefaultStyles = (editor: Editor): StringMap =>
  editor.getParam('table_default_styles', determineDefaultStyles(editor), 'object');

const hasTableResizeBars = (editor: Editor): boolean =>
  editor.getParam('table_resize_bars', true, 'boolean');

const hasTabNavigation = (editor: Editor): boolean =>
  editor.getParam('table_tab_navigation', true, 'boolean');

const hasAdvancedCellTab = (editor: Editor): boolean =>
  editor.getParam('table_cell_advtab', true, 'boolean');

const hasAdvancedRowTab = (editor: Editor): boolean =>
  editor.getParam('table_row_advtab', true, 'boolean');

const hasAdvancedTableTab = (editor: Editor): boolean =>
  editor.getParam('table_advtab', true, 'boolean');

const hasAppearanceOptions = (editor: Editor): boolean =>
  editor.getParam('table_appearance_options', true, 'boolean');

const hasTableGrid = (editor: Editor): boolean =>
  editor.getParam('table_grid', true, 'boolean');

const shouldStyleWithCss = (editor: Editor): boolean =>
  editor.getParam('table_style_by_css', false, 'boolean');

const getCellClassList = (editor: Editor): UserListItem[] =>
  editor.getParam('table_cell_class_list', [], 'array');

const getRowClassList = (editor: Editor): UserListItem[] =>
  editor.getParam('table_row_class_list', [], 'array');

const getTableClassList = (editor: Editor): UserListItem[] =>
  editor.getParam('table_class_list', [], 'array');

const isPercentagesForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'relative' || getTableResponseWidth(editor) === true;

const isPixelsForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'fixed' || getTableResponseWidth(editor) === false;

const isResponsiveForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'responsive';

const getToolbar = (editor: Editor): string =>
  editor.getParam('table_toolbar', defaultTableToolbar);

const useColumnGroup = (editor: Editor): boolean =>
  editor.getParam('table_use_colgroups', false, 'boolean');

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

const getColumnResizingBehaviour = (editor: Editor): 'preservetable' | 'resizetable' => {
  const validModes: Array<'preservetable' | 'resizetable'> = [ 'preservetable', 'resizetable' ];
  const givenMode = editor.getParam('table_column_resizing', defaultColumnResizingBehaviour, 'string');
  return Arr.find(validModes, (mode) => mode === givenMode).getOr(defaultColumnResizingBehaviour);
};

const isPreserveTableColumnResizing = (editor: Editor): boolean =>
  getColumnResizingBehaviour(editor) === 'preservetable';

const isResizeTableColumnResizing = (editor: Editor): boolean =>
  getColumnResizingBehaviour(editor) === 'resizetable';

const getCloneElements = (editor: Editor): Optional<string[]> => {
  const cloneElements = editor.getParam('table_clone_elements');

  if (Type.isString(cloneElements)) {
    return Optional.some(cloneElements.split(/[ ,]/));
  } else if (Array.isArray(cloneElements)) {
    return Optional.some(cloneElements);
  } else {
    return Optional.none();
  }
};

const hasObjectResizing = (editor: Editor): boolean => {
  const objectResizing = editor.getParam('object_resizing', true);
  return Type.isString(objectResizing) ? objectResizing === 'table' : objectResizing;
};

const getTableBackgroundColorMap = (editor: Editor): UserListValue[] =>
  editor.getParam('table_background_color_map', [], 'array');

const getTableBorderColorMap = (editor: Editor): UserListValue[] =>
  editor.getParam('table_border_color_map', [], 'array');

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
  getTableHeaderType,
  getColumnResizingBehaviour,
  isPreserveTableColumnResizing,
  isResizeTableColumnResizing,
  getTableBorderWidths,
  getTableBorderStyles,
  getTableBackgroundColorMap,
  getTableBorderColorMap,
  useColumnGroup
};
