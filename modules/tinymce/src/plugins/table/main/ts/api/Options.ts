/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { UserListItem, UserListValue } from '../ui/UiUtils';

export interface StringMap {
  [key: string]: string;
}

type TableSizingMode = 'fixed' | 'relative' | 'responsive' | 'auto';

const defaultTableToolbar = 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol';

const defaultAttributes = {
  border: '1'
};

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

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('table_border_widths', {
    processor: 'object[]',
    default: defaultCellBorderWidths
  });

  registerOption('table_border_styles', {
    processor: 'object[]',
    default: defaultCellBorderStyles
  });

  registerOption('table_default_attributes', {
    processor: 'object',
    default: defaultAttributes
  });

  registerOption('table_default_styles', {
    processor: 'object',
    default: defaultStyles
  });

  registerOption('table_cell_advtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_row_advtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_advtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_appearance_options', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_grid', {
    processor: 'boolean',
    // Table grid relies on hover, which isn't available on touch devices so use the dialog instead
    default: !Env.deviceType.isTouch()
  });

  registerOption('table_style_by_css', {
    processor: 'boolean',
    default: false
  });

  registerOption('table_cell_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_row_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_toolbar', {
    processor: 'string',
    default: defaultTableToolbar
  });

  registerOption('table_use_colgroups', {
    processor: 'boolean',
    default: false
  });

  registerOption('table_background_color_map', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_border_color_map', {
    processor: 'object[]',
    default: []
  });
};

const getTableSizingMode = option<TableSizingMode>('table_sizing_mode');
const getTableBorderWidths = option<UserListItem[]>('table_border_widths');
const getTableBorderStyles = option<UserListValue[]>('table_border_styles');
const getDefaultAttributes = option<StringMap>('table_default_attributes');
const hasAdvancedCellTab = option<boolean>('table_cell_advtab');
const hasAdvancedRowTab = option<boolean>('table_row_advtab');
const hasAdvancedTableTab = option<boolean>('table_advtab');
const hasAppearanceOptions = option<boolean>('table_appearance_options');
const hasTableGrid = option<boolean>('table_grid');
const shouldStyleWithCss = option<boolean>('table_style_by_css');
const getCellClassList = option<UserListItem[]>('table_cell_class_list');
const getRowClassList = option<UserListItem[]>('table_row_class_list');
const getTableClassList = option<UserListItem[]>('table_class_list');
const getToolbar = option<string>('table_toolbar');
const useColumnGroup = option<boolean>('table_use_colgroups');
const getTableHeaderType = option<string>('table_header_type');
const getTableBackgroundColorMap = option<UserListValue[]>('table_background_color_map');
const getTableBorderColorMap = option<UserListValue[]>('table_border_color_map');

const isPercentagesForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'relative';

const isPixelsForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'fixed';

const isResponsiveForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'responsive';

const getDefaultStyles = (editor: Editor): StringMap => {
  // Note: The we don't rely on the default here as we need to dynamically lookup the widths based on the current editor state
  const options = editor.options;
  return options.isSet('table_default_styles') ? options.get('table_default_styles') : determineDefaultStyles(editor);
};

export {
  register,
  getDefaultAttributes,
  getDefaultStyles,
  hasAdvancedCellTab,
  hasAdvancedRowTab,
  hasAdvancedTableTab,
  hasAppearanceOptions,
  hasTableGrid,
  shouldStyleWithCss,
  getCellClassList,
  getRowClassList,
  getTableClassList,
  isPercentagesForced,
  isPixelsForced,
  isResponsiveForced,
  getToolbar,
  getTableHeaderType,
  getTableBorderWidths,
  getTableBorderStyles,
  getTableBackgroundColorMap,
  getTableBorderColorMap,
  useColumnGroup
};
