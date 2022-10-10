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

export default (): void => {
  ThemeManager.add('silver', (editor): Theme => {
    registerOptions(editor);
    const { forDialogs, forPopups, renderUI }: RenderInfo = Render.setup(editor);

    Autocompleter.register(editor, forPopups.backstage.shared);

    const windowMgr = WindowManager.setup({
      editor,
      backstages: {
        popup: forPopups.backstage,
        dialog: forDialogs.backstage
      }
    });

    // The NotificationManager uses the popup mothership (and sink)
    const getNotificationManagerImpl = () => NotificationManagerImpl(
      editor,
      { backstage: forPopups.backstage },
      forPopups.getMothership()
    );

    return {
      renderUI,
      getWindowManagerImpl: Fun.constant(windowMgr),
      getNotificationManagerImpl
    };
  });
};
