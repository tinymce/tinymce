/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as FilterContent from '../core/FilterContent';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from './Settings';

const register = (editor: Editor) => {
  editor.addCommand('mcePageBreak', () => {
    if (Settings.shouldSplitBlock(editor)) {
      editor.insertContent('<p>' + FilterContent.getPlaceholderHtml() + '</p>');
    } else {
      editor.insertContent(FilterContent.getPlaceholderHtml());
    }
  });
};

export {
  register
};
