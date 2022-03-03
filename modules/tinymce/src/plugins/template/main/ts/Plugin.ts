import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as FilterContent from './core/FilterContent';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('template', (editor) => {
    Options.register(editor);
    Buttons.register(editor);
    Commands.register(editor);
    FilterContent.setup(editor);
  });
};
