import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import { ScrollInfo } from './core/Actions';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('fullscreen', (editor) => {
    const fullscreenState = Cell<ScrollInfo | null>(null);

    if (editor.inline) {
      return Api.get(fullscreenState);
    }

    Options.register(editor);
    Commands.register(editor, fullscreenState);
    Buttons.register(editor, fullscreenState);

    editor.addShortcut('Meta+Shift+F', '', 'mceFullScreen');

    return Api.get(fullscreenState);
  });
};
