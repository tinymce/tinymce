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

var get = function (editor) {
  var renderUI = function (args) {
    return Render.renderUI(editor, this, args);
  };

  var resizeTo = function (w, h) {
    return Resize.resizeTo(editor, w, h);
  };

  var resizeBy = function (dw, dh) {
    return Resize.resizeBy(editor, dw, dh);
  };

  var getNotificationManagerImpl = function () {
    return NotificationManagerImpl(editor);
  };

  var getWindowManagerImpl = function () {
    return WindowManagerImpl(editor);
  };

  return {
    renderUI: renderUI,
    resizeTo: resizeTo,
    resizeBy: resizeBy,
    getNotificationManagerImpl: getNotificationManagerImpl,
    getWindowManagerImpl: getWindowManagerImpl
  };
};

export default <any> {
  get: get
};