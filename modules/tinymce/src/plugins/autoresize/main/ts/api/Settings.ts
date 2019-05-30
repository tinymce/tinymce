/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getAutoResizeMinHeight = (editor: Editor): number => {
  return editor.getParam('min_height', editor.getElement().offsetHeight, 'number');
};

const getAutoResizeMaxHeight = (editor: Editor): number => {
  return editor.getParam('max_height', 0, 'number');
};

const getAutoResizeOverflowPadding = (editor: Editor): number => {
  return editor.getParam('autoresize_overflow_padding', 1, 'number');
};

const getAutoResizeBottomMargin = (editor: Editor): number => {
  return editor.getParam('autoresize_bottom_margin', 50, 'number');
};

const shouldAutoResizeOnInit = (editor: Editor): boolean => {
  return editor.getParam('autoresize_on_init', true, 'boolean');
};

export default {
  getAutoResizeMinHeight,
  getAutoResizeMaxHeight,
  getAutoResizeOverflowPadding,
  getAutoResizeBottomMargin,
  shouldAutoResizeOnInit
};