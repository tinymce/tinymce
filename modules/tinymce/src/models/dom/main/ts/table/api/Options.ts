/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

export interface StringMap {
  [key: string]: string;
}

 type TableSizingMode = 'fixed' | 'relative' | 'responsive' | 'auto';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('table_sizing_mode', {
    processor: 'string',
    default: 'auto'
  });

  registerOption('table_header_type', {
    processor: (value) => {
      const valid = Arr.contains([ 'section', 'cells', 'sectionCells', 'auto' ], value);
      return valid ? { value, valid } : { valid: false, message: 'Must be one of: section, cells, sectionCells or auto.' };
    },
    default: 'section'
  });
};

const getColumnResizingBehaviour = option<'preservetable' | 'resizetable'>('table_column_resizing');

const getTableSizingMode = option<TableSizingMode>('table_sizing_mode');
const getTableHeaderType = option<string>('table_header_type');

const isPercentagesForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'relative';

const isPixelsForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'fixed';

const isResponsiveForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'responsive';

const getCloneElements = (editor: Editor): string[] =>
  editor.options.get('table_clone_elements');

export {
  register,
  getCloneElements,
  isPercentagesForced,
  isPixelsForced,
  isResponsiveForced,
  getTableHeaderType,
  getColumnResizingBehaviour
};
