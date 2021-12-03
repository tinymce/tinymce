/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import ThemeManager, { Theme } from 'tinymce/core/api/ThemeManager';

import NotificationManagerImpl from './alien/NotificationManagerImpl';
import * as Options from './api/Options';
import { Autocompleter } from './Autocompleter';
import * as Render from './Render';
import * as ColorOptions from './ui/core/color/Options';
import * as WindowManager from './ui/dialog/WindowManager';
import * as ContextMenuOptions from './ui/menus/contextmenu/Options';

type RenderInfo = Render.RenderInfo;

const registerOptions = (editor: Editor) => {
  Options.register(editor);
  ColorOptions.register(editor);
  ContextMenuOptions.register(editor);
};

export default () => {
  ThemeManager.add('silver', (editor): Theme => {
    registerOptions(editor);
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
};
