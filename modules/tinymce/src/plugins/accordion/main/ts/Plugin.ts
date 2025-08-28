import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as FilterContent from './core/FilterContent';
import * as Keyboard from './core/Keyboard';
import * as Quirks from './core/Quirks';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('accordion', (editor) => {
    Buttons.register(editor);
    Commands.register(editor);
    Keyboard.setup(editor);
    FilterContent.setup(editor);
    Quirks.setup(editor);
  });
};
