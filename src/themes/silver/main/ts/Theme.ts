/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Debugging } from '@ephox/alloy';
import { Fun, Id } from '@ephox/katamari';
import ThemeManager, { Theme } from 'tinymce/core/api/ThemeManager';
import NotificationManagerImpl from './alien/NotificationManagerImpl';
import { Autocompleter } from './Autocompleter';
import Render, { RenderInfo } from './Render';
import FormatControls from './ui/core/FormatControls';
import WindowManager from './ui/dialog/WindowManager';

ThemeManager.add('silver', (editor): Theme => {
  const { mothership, uiMothership, backstage, renderUI, getUi }: RenderInfo = Render.setup(editor);

  FormatControls.setup(editor, backstage);

  Debugging.registerInspector(Id.generate('silver-demo'), mothership);
  Debugging.registerInspector(Id.generate('silver-ui-demo'), uiMothership);

  Autocompleter.register(editor, backstage.shared);

  const windowMgr = WindowManager.setup({ editor, backstage });

  return {
    renderUI,
    getWindowManagerImpl: Fun.constant(windowMgr),
    getNotificationManagerImpl: () => {
      return NotificationManagerImpl(editor, {backstage}, uiMothership);
    },
    // TODO: move to editor.ui namespace
    ui: getUi()
  };
});

export default function () { }