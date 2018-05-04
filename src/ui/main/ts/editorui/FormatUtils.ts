/**
 * FormatUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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