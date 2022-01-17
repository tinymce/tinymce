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

  registerOption('lists_indent_on_tab', {
    processor: 'boolean',
    default: true
  });
};

const shouldIndentOnTab = option<boolean>('lists_indent_on_tab');
const getForcedRootBlock = option('forced_root_block');
const getForcedRootBlockAttrs = option('forced_root_block_attrs');

export {
  register,
  shouldIndentOnTab,
  getForcedRootBlock,
  getForcedRootBlockAttrs
};
