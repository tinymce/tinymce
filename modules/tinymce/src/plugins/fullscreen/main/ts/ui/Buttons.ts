import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ScrollInfo } from '../core/Actions';

const makeSetupHandler = (editor: Editor, fullscreenState: Cell<ScrollInfo | null>) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi) => {
  api.setActive(fullscreenState.get() !== null);
  const editorEventCallback = (e: EditorEvent<{ state: boolean }>) => api.setActive(e.state);
  editor.on('FullscreenStateChanged', editorEventCallback);
  return () => editor.off('FullscreenStateChanged', editorEventCallback);
};

const register = (editor: Editor, fullscreenState: Cell<ScrollInfo | null>): void => {
  const onAction = () => editor.execCommand('mceFullScreen');

  editor.ui.registry.addToggleMenuItem('fullscreen', {
    text: 'Fullscreen',
    icon: 'fullscreen',
    shortcut: 'Meta+Shift+F',
    onAction,
    onSetup: makeSetupHandler(editor, fullscreenState)
  });

  editor.ui.registry.addToggleButton('fullscreen', {
    tooltip: 'Fullscreen',
    icon: 'fullscreen',
    onAction,
    onSetup: makeSetupHandler(editor, fullscreenState)
  });
};

export {
  register
};
