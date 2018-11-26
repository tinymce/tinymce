/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getAutoResizeMinHeight = function (editor) {
  return parseInt(editor.getParam('min_height', editor.getElement().offsetHeight, 'number'), 10);
};

const getAutoResizeMaxHeight = function (editor) {
  return parseInt(editor.getParam('max_height', 0, 'number'), 10);
};

const getAutoResizeOverflowPadding = function (editor) {
  return editor.getParam('autoresize_overflow_padding', 1, 'number');
};

const getAutoResizeBottomMargin = function (editor) {
  return editor.getParam('autoresize_bottom_margin', 50, 'number');
};

const shouldAutoResizeOnInit = function (editor) {
  return editor.getParam('autoresize_on_init', true, 'boolean');
};

export default {
  getAutoResizeMinHeight,
  getAutoResizeMaxHeight,
  getAutoResizeOverflowPadding,
  getAutoResizeBottomMargin,
  shouldAutoResizeOnInit
};