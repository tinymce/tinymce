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

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('autoresize_overflow_padding', {
    processor: 'number',
    default: 1
  });

  registerOption('autoresize_bottom_margin', {
    processor: 'number',
    default: 50
  });
};

const getMinHeight = option('min_height');
const getMaxHeight = option('max_height');
const getAutoResizeOverflowPadding = option<number>('autoresize_overflow_padding');
const getAutoResizeBottomMargin = option<number>('autoresize_bottom_margin');

export {
  register,
  getMinHeight,
  getMaxHeight,
  getAutoResizeOverflowPadding,
  getAutoResizeBottomMargin
};
