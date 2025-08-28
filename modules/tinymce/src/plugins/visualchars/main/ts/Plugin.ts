import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Bindings from './core/Bindings';
import * as Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('visualchars', (editor) => {
    Options.register(editor);

    const toggleState = Cell(Options.isEnabledByDefault(editor));
    Commands.register(editor, toggleState);
    Buttons.register(editor, toggleState);
    Keyboard.setup(editor, toggleState);
    Bindings.setup(editor, toggleState);

    return Api.get(toggleState);
  });
};
