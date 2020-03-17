/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import ThemeManager, { Theme } from 'tinymce/core/api/ThemeManager';
import NotificationManagerImpl from './alien/NotificationManagerImpl';
import { Autocompleter } from './Autocompleter';
import * as Render from './Render';
import * as WindowManager from './ui/dialog/WindowManager';

type RenderInfo = Render.RenderInfo;

export default function () {
  ThemeManager.add('silver', (editor): Theme => {
    const { uiMothership, backstage, renderUI, getUi }: RenderInfo = Render.setup(editor);

    Autocompleter.register(editor, backstage.shared);

    const windowMgr = WindowManager.setup({ editor, backstage });

    return {
      renderUI,
      getWindowManagerImpl: Fun.constant(windowMgr),
      getNotificationManagerImpl: () => NotificationManagerImpl(editor, { backstage }, uiMothership),
      // TODO: move to editor.ui namespace
      ui: getUi()
    };
  });
}
