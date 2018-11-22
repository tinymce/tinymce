/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Render from '../core/Render';
import NotificationManagerImpl from 'tinymce/ui/NotificationManagerImpl';
import WindowManagerImpl from 'tinymce/ui/WindowManagerImpl';
import { Editor } from 'tinymce/core/api/Editor';
import { InlitePanel } from 'tinymce/themes/inlite/ui/Panel';

const get = function (editor: Editor, panel: InlitePanel) {
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