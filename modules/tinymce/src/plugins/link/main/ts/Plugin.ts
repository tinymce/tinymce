import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Keyboard from './core/Keyboard';
import * as Controls from './ui/Controls';

export default (): void => {
  PluginManager.add('link', (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Controls.setup(editor);
    Keyboard.setup(editor);
  });
};
