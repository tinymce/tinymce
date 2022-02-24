import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const toggleActiveState = (editor: Editor, enabledState: Cell<boolean>) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi) => {
  api.setActive(enabledState.get());
  const editorEventCallback = (e: EditorEvent<{ state: boolean }>) => api.setActive(e.state);
  editor.on('VisualBlocks', editorEventCallback);
  return () => editor.off('VisualBlocks', editorEventCallback);
};

const register = (editor: Editor, enabledState: Cell<boolean>): void => {
  const onAction = () => editor.execCommand('mceVisualBlocks');

  editor.ui.registry.addToggleButton('visualblocks', {
    icon: 'visualblocks',
    tooltip: 'Show blocks',
    onAction,
    onSetup: toggleActiveState(editor, enabledState)
  });

  editor.ui.registry.addToggleMenuItem('visualblocks', {
    text: 'Show blocks',
    icon: 'visualblocks',
    onAction,
    onSetup: toggleActiveState(editor, enabledState)
  });
};

export {
  register
};
