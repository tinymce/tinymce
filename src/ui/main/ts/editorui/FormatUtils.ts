/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';

const toggleFormat = (editor: Editor, fmt: string) => {
  return function () {
    editor.execCommand('mceToggleFormat', false, fmt);
  };
};

const addFormatChangedListener = (editor: Editor, name: string, changed: (state: boolean, name: string) => void) => {
  const handler = (state) => {
    changed(state, name);
  };

  if (editor.formatter) {
    editor.formatter.formatChanged(name, handler);
  } else {
    editor.on('init', () => {
      editor.formatter.formatChanged(name, handler);
    });
  }
};

const postRenderFormatToggle = (editor: Editor, name: string) => (e) => {
  addFormatChangedListener(editor, name, (state) => {
    e.control.active(state);
  });
};

export {
  toggleFormat,
  addFormatChangedListener,
  postRenderFormatToggle
};