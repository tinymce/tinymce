import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Bindings from './core/Bindings';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('visualblocks', (editor, pluginUrl) => {
    Options.register(editor);

    const enabledState = Cell(false);
    Commands.register(editor, pluginUrl, enabledState);
    Buttons.register(editor, enabledState);
    Bindings.setup(editor, pluginUrl, enabledState);
  });
};
