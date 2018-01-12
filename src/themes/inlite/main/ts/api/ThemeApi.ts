/**
 * ThemeApi.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Render from '../core/Render';
import NotificationManagerImpl from 'tinymce/ui/NotificationManagerImpl';
import WindowManagerImpl from 'tinymce/ui/WindowManagerImpl';

const get = function (editor, panel) {
  const renderUI = function () {
    return Render.renderUI(editor, panel);
  };

  return {
    renderUI,
    getNotificationManagerImpl () {
      return NotificationManagerImpl(editor);
    },
    getWindowManagerImpl () {
      return WindowManagerImpl(editor);
    }
  };
};

export default {
  get
};