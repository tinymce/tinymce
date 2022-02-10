/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

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

const getCloneElements = option('table_clone_elements');

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

export {
  register,

  getCloneElements,
  isTablePercentagesForced,
  isTablePixelsForced,
  isTableResponsiveForced,
  getTableHeaderType,
  getColumnResizingBehaviour,
  getTableColumnResizingBehaviour,
  hasTableObjectResizing,
  hasTableResizeBars
};
