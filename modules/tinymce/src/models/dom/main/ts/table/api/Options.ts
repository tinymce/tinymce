/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

export type TableSizingMode = 'fixed' | 'relative' | 'responsive' | 'auto';
export type TableColumnResizing = 'preservetable' | 'resizetable';
export type TableHeaderType = 'section' | 'cells' | 'sectionCells' | 'auto';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

// Note: This is also specified in the table plugin Options.ts file
const defaultTableStyles = {
  'border-collapse': 'collapse',
  'width': '100%'
};

// Note: This is also contained in the table plugin Options.ts file
const determineDefaultTableStyles = (editor: Editor): Record<string, string> => {
  if (isTablePixelsForced(editor)) {
    // Determine the inner size of the parent block element where the table will be inserted
    const dom = editor.dom;
    const parentBlock = dom.getParent<HTMLElement>(editor.selection.getStart(), dom.isBlock) ?? editor.getBody();
    const contentWidth = Width.getInner(SugarElement.fromDom(parentBlock));
    return { ...defaultTableStyles, width: contentWidth + 'px' };
  } else if (isTableResponsiveForced(editor)) {
    return Obj.filter(defaultTableStyles, (_value, key) => key !== 'width');
  } else {
    return defaultTableStyles;
  }
};

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('table_clone_elements', {
    processor: 'string[]'
  });

  registerOption('table_use_colgroups', {
    processor: 'boolean',
    default: false
  });

  registerOption('table_header_type', {
    processor: (value) => {
      const valid = Arr.contains([ 'section', 'cells', 'sectionCells', 'auto' ], value);
      return valid ? { value, valid } : { valid: false, message: 'Must be one of: section, cells, sectionCells or auto.' };
    },
    default: 'section'
  });

  registerOption('table_sizing_mode', {
    processor: 'string',
    default: 'auto'
  });

  registerOption('table_default_attributes', {
    processor: 'object',
    default: {
      border: '1'
    }
  });

  registerOption('table_default_styles', {
    processor: 'object',
    default: defaultTableStyles
  });

  registerOption('table_column_resizing', {
    processor: (value) => {
      const valid = Arr.contains([ 'preservetable', 'resizetable' ], value);
      return valid ? { value, valid } : { valid: false, message: 'Must be preservetable, or resizetable.' };
    },
    default: 'preservetable'
  });

  registerOption('table_resize_bars', {
    processor: 'boolean',
    default: true
  });
};

const getTableCloneElements = option('table_clone_elements');

const getColumnResizingBehaviour = option('table_column_resizing');

const getTableSizingMode = option('table_sizing_mode');

const getTableHeaderType = option('table_header_type');

const isTablePercentagesForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'relative';

const isTablePixelsForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'fixed';

const isTableResponsiveForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'responsive';

const hasTableResizeBars = option('table_resize_bars');

const getTableColumnResizingBehaviour = option('table_column_resizing');

const hasTableObjectResizing = (editor: Editor): boolean => {
  const objectResizing = editor.options.get('object_resizing');
  return Arr.contains(objectResizing.split(','), 'table');
};

const getTableDefaultAttributes = option('table_default_attributes');

const getTableDefaultStyles = (editor: Editor): Record<string, string> => {
  // Note: The we don't rely on the default here as we need to dynamically lookup the widths based on the current editor state
  const options = editor.options;
  return options.isSet('table_default_styles') ? options.get('table_default_styles') : determineDefaultTableStyles(editor);
};

const tableUseColumnGroup = option('table_use_colgroups');

export {
  register,

  getTableCloneElements,
  isTablePercentagesForced,
  isTablePixelsForced,
  isTableResponsiveForced,
  getTableHeaderType,
  getColumnResizingBehaviour,
  getTableColumnResizingBehaviour,
  hasTableObjectResizing,
  hasTableResizeBars,
  getTableDefaultAttributes,
  getTableDefaultStyles,
  tableUseColumnGroup
};
