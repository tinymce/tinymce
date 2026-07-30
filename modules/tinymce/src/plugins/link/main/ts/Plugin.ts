import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Keyboard from './core/Keyboard';
import * as Controls from './ui/Controls';

const PLUGIN_CODE = 'link';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Controls.setup(editor);
    Keyboard.setup(editor);

    return {
      getMetadata: () => ({ name: 'Link', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
