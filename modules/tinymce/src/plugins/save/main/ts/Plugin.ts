import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('save', (editor) => {
    Options.register(editor);
    Buttons.register(editor);
    Commands.register(editor);
  });
};
