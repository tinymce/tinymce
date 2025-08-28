import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import { FullScreenInfo } from './core/Actions';
import * as Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('fullscreen', (editor) => {
    const fullscreenState = Cell<FullScreenInfo | null>(null);

    if (editor.inline) {
      return Api.get(fullscreenState);
    }

    Options.register(editor);
    Commands.register(editor, fullscreenState);
    Buttons.register(editor, fullscreenState);
    Keyboard.setup(editor, fullscreenState);

    editor.addShortcut('Meta+Shift+F', '', 'mceFullScreen');

    return Api.get(fullscreenState);
  });
};
