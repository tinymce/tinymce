import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('ai', (editor) => {
    Commands.register(editor);
    Buttons.register(editor);
  });
};
