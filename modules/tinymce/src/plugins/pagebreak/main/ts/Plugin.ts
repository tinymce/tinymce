import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as FilterContent from './core/FilterContent';
import * as ResolveName from './core/ResolveName';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('pagebreak', (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Buttons.register(editor);
    FilterContent.setup(editor);
    ResolveName.setup(editor);
  });
};
