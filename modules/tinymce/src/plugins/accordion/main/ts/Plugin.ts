import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as FilterContent from './core/content/FilterContent';
import * as Keyboard from './core/Keyboard';
import * as Quirks from './core/Quirks';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'accordion';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Buttons.register(editor);
    Commands.register(editor);
    Keyboard.setup(editor);
    FilterContent.setup(editor);
    Quirks.setup(editor);

    return {
      getMetadata: () => ({ name: 'Accordion', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
