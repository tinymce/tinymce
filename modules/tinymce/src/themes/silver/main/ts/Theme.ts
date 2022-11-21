import { Boxes } from '@ephox/alloy';
import { Cell, Fun } from '@ephox/katamari';

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

    // When using the ui_of_tomorrow, the popup sink is placed as a sibling to the
    // editor, which means that it might be subject to any scrolling environments
    // that the editor has. Therefore, we want to make the popup sink have an overall
    // bounds that is depeendent on its scrolling environment. We don't know that ahead
    // of time, so we use a cell whose value will change if there is a scrolling context.
    const popupSinkBounds = Cell<() => Boxes.Bounds>(() => Boxes.win());

    const { dialogs, popups, renderUI: renderModeUI }: RenderInfo = Render.setup(editor, {
      // consult the cell to find out the bounds for the popup sink. When renderUI is
      // called, this cell might have its value changed.
      getPopupSinkBounds: () => popupSinkBounds.get()()
    });

    // We wrap the `renderModeUI` function being returned by Render so that we can update
    // the getPopupSinkBounds cell is required.
    const renderUI = (): RenderResult => {
      const renderResult = renderModeUI();
      const optScrollingContext = ScrollingContext.detect(popups.getMothership().element);
      optScrollingContext.each(
        (sc) => popupSinkBounds.set(
          () => {
            // At this stage, it looks like we need to calculate the bounds each time, just in
            // case the scrolling context details have changed since the last time. The bounds considers
            // the Boxes.box sizes, which might change over time.
            return ScrollingContext.getBoundsFrom(sc);
          }
        )
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
