import { Boxes } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import ThemeManager, { RenderResult, Theme } from 'tinymce/core/api/ThemeManager';

import NotificationManagerImpl from './alien/NotificationManagerImpl';
import * as Options from './api/Options';
import { Autocompleter } from './Autocompleter';
import * as ScrollingContext from './modes/ScrollingContext';
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

    // When using the ui_mode: split, the popup sink is placed as a sibling to the
    // editor, which means that it might be subject to any scrolling environments
    // that the editor has. Therefore, we want to make the popup sink have an overall
    // bounds that is dependent on its scrolling environment. We don't know that ahead
    // of time, so we use a mutable variable whose value will change if there is a scrolling context.
    let popupSinkBounds = () => Boxes.win();

    const { dialogs, popups, renderUI: renderModeUI }: RenderInfo = Render.setup(editor, {
      // consult the mutable variable to find out the bounds for the popup sink. When renderUI is
      // called, this mutable variable might be reassigned
      getPopupSinkBounds: () => popupSinkBounds()
    });

    // We wrap the `renderModeUI` function being returned by Render so that we can update
    // the getPopupSinkBounds mutable variable if required.
    // DON'T define this function as `async`; otherwise, it will slow down the rendering process and cause flickering if the editor is repeatedly removed and re-initialized.
    const renderUI = (): RenderResult => {
      const renderResult = renderModeUI();

      const optScrollingContext = ScrollingContext.detectWhenSplitUiMode(
        editor,
        popups.getMothership().element
      );
      optScrollingContext.each(
        (sc) => {
          popupSinkBounds = () => {
            // At this stage, it looks like we need to calculate the bounds each time, just in
            // case the scrolling context details have changed since the last time. The bounds considers
            // the Boxes.box sizes, which might change over time.
            return ScrollingContext.getBoundsFrom(sc);
          };
        }
      );

      return renderResult;
    };

    Autocompleter.register(editor, popups.backstage.shared);

    const windowMgr = WindowManager.setup({
      editor,
      backstages: {
        popup: popups.backstage,
        dialog: dialogs.backstage
      }
    });

    // The NotificationManager uses the popup mothership (and sink)
    const getNotificationManagerImpl = () => NotificationManagerImpl(
      editor,
      { backstage: popups.backstage },
      popups.getMothership()
    );

    return {
      renderUI,
      getWindowManagerImpl: Fun.constant(windowMgr),
      getNotificationManagerImpl
    };
  });
};
