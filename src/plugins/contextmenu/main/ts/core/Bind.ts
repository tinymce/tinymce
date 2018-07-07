/**
 * Bind.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import Coords from './Coords';
import ContextMenu from '../ui/ContextMenu';

const isNativeOverrideKeyEvent = function (editor, e) {
  return e.ctrlKey && !Settings.shouldNeverUseNative(editor);
};

const setup = function (editor, visibleState, menu) {
  // 是否选中的空选区
  let isEmptySelection = false;
  // 监听鼠标右键（判断是否是右键）
  editor.on('mousedown', function (e) {
    isEmptySelection = false
    // 右键事件
    const isRightClick = e.buttons === 2 || e.which === 3
    if (isRightClick) {
      const selectValue = document.getSelection().toString()
      isEmptySelection = selectValue.length === 0
    }
  });
  // 选区事件（禁止自动选区）
  editor.on('selectstart', function (e) {
    if (isEmptySelection) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    }
  });
  editor.on('contextmenu', function (e) {
    if (isNativeOverrideKeyEvent(editor, e)) {
      return;
    }
    e.preventDefault();
    ContextMenu.show(editor, Coords.getPos(editor, e), visibleState, menu);
  });
};

export default {
  setup
};