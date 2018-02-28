/**
 * ThemeApi.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Render from '../ui/Render';
import Resize from '../ui/Resize';
import NotificationManagerImpl from 'tinymce/ui/NotificationManagerImpl';
import WindowManagerImpl from 'tinymce/ui/WindowManagerImpl';

const get = function (editor) {
  const renderUI = function (args) {
    return Render.renderUI(editor, this, args);
  };

  const resizeTo = function (w, h) {
    return Resize.resizeTo(editor, w, h);
  };

  const resizeBy = function (dw, dh) {
    return Resize.resizeBy(editor, dw, dh);
  };

  const getNotificationManagerImpl = function () {
    return NotificationManagerImpl(editor);
  };

  const getWindowManagerImpl = function () {
    return WindowManagerImpl(editor);
  };

  return {
    renderUI,
    resizeTo,
    resizeBy,
    getNotificationManagerImpl,
    getWindowManagerImpl
  };
};

export default {
  get
};