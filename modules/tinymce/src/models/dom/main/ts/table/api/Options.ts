/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const getCloneElements = option('table_clone_elements');

const getColumnResizingBehaviour = option('table_column_resizing');

const getTableSizingMode = option('table_sizing_mode');

const getTableHeaderType = option('table_header_type');

const isPercentagesForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'relative';

const isPixelsForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'fixed';

const isResponsiveForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'responsive';

export {
  getCloneElements,
  isPercentagesForced,
  isPixelsForced,
  isResponsiveForced,
  getTableHeaderType,
  getColumnResizingBehaviour
};
