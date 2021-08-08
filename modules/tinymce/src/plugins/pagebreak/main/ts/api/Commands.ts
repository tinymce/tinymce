/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as FilterContent from '../core/FilterContent';
import * as Settings from './Settings';

const register = (editor: Editor): void => {
  editor.addCommand('mcePageBreak', () => {
    editor.insertContent(FilterContent.getPlaceholderHtml(Settings.shouldSplitBlock(editor)));
  });
};

export {
  register
};
