import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { PastePlainTextToggleEvent } from 'tinymce/core/api/EventTypes';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Options from '../../api/Options';
import { composeUnbinders, onSetupEditableToggle } from './ControlUtils';

const makeSetupHandler = (editor: Editor, pasteAsText: Cell<boolean>) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi) => {
  api.setActive(pasteAsText.get());
  const pastePlainTextToggleHandler = (e: EditorEvent<PastePlainTextToggleEvent>) => {
    pasteAsText.set(e.state);
    api.setActive(e.state);
  };
  editor.on('PastePlainTextToggle', pastePlainTextToggleHandler);

  return composeUnbinders(
    () => editor.off('PastePlainTextToggle', pastePlainTextToggleHandler),
    onSetupEditableToggle(editor)(api)
  );
};

const register = (editor: Editor): void => {
  const pasteAsText = Cell(Options.getPasteAsText(editor));
  const onAction = () => editor.execCommand('mceTogglePlainTextPaste');

  editor.ui.registry.addToggleButton('pastetext', {
    active: false,
    icon: 'paste-text',
    tooltip: 'Paste as text',
    onAction,
    onSetup: makeSetupHandler(editor, pasteAsText)
  });

  editor.ui.registry.addToggleMenuItem('pastetext', {
    text: 'Paste as text',
    icon: 'paste-text',
    onAction,
    onSetup: makeSetupHandler(editor, pasteAsText)
  });
};

export {
  register
};
