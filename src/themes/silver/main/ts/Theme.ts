import { Debugging } from '@ephox/alloy';
import { Fun, Id, Merger, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import ThemeManager from 'tinymce/core/api/ThemeManager';

import NotificationManagerImpl from './alien/NotificationManagerImpl';
import { Autocompleter } from './Autocompleter';
import Render, { RenderInfo } from './Render';
import FormatControls from './ui/core/FormatControls';
import WindowManager from './ui/dialog/WindowManager';

ThemeManager.add('silver', (editor: Editor) => {
  const {mothership, uiMothership, backstage, renderUI, getUi}: RenderInfo = Render.setup(editor);

  FormatControls.setup(editor);

  Debugging.registerInspector(Id.generate('silver-demo'), mothership);
  Debugging.registerInspector(Id.generate('silver-ui-demo'), uiMothership);

  Autocompleter.register(editor, backstage.shared);

  const windowMgr = WindowManager.setup({backstage});

  return {
    renderUI,
    getWindowManagerImpl () {

      const getTop = () => {
        const win = editor.windowManager.windows;
        return Option.from(win[win.length - 1]);
      };

      const currentWin = getTop().fold(() => {
        return {
          getParams: Fun.noop,
          setParams: Fun.noop
        };
      }, (win) => {
        return {
          getParams: win.getData,
          setParams: win.setData
        };
      });

      const windows = {
        getWindows: () => editor.windowManager.windows,
        windows: editor.windowManager.windows
      };

      return Merger.merge(windowMgr, currentWin, windows);
    },
    getNotificationManagerImpl: () => {
      return NotificationManagerImpl(editor, {backstage}, uiMothership);
    },
    // TODO: move to editor.ui namespace
    ui: getUi()
  };
});

export default function () { }